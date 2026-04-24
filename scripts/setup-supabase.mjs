import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

function loadEnvFile(path) {
  if (!existsSync(path)) return

  const content = readFileSync(path, "utf8")
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const separatorIndex = line.indexOf("=")
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function requireEnv(key) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return value
}

async function main() {
  const envPath = resolve(process.cwd(), ".env.local")
  loadEnvFile(envPath)

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const adminEmail = requireEnv("ADMIN_EMAIL")
  const adminPassword = requireEnv("ADMIN_PASSWORD")
  const adminFullName = process.env.ADMIN_FULL_NAME || "Clinic Admin"

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: adminFullName,
      role: "admin",
    },
  })

  let userId = data.user?.id
  if (error) {
    if (
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("exists")
    ) {
      const { data: listData, error: listError } =
        await supabase.auth.admin.listUsers()
      if (listError) throw listError

      const existingUser = listData.users.find(
        (user) => user.email?.toLowerCase() === adminEmail.toLowerCase()
      )
      if (!existingUser?.id) {
        throw new Error(`Admin user exists but could not be fetched: ${adminEmail}`)
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            full_name: adminFullName,
            role: "admin",
          },
        }
      )
      if (updateError) throw updateError

      userId = existingUser.id
      console.log(`Admin user already existed. Password updated: ${adminEmail}`)
    } else {
      throw error
    }
  }

  if (!userId) {
    throw new Error("Could not resolve admin user ID after setup.")
  }

  const { error: upsertError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: adminFullName,
    role: "admin",
  })

  if (upsertError) {
    if (upsertError.message?.includes("public.profiles")) {
      throw new Error(
        "Missing table public.profiles. Run supabase/schema.sql in your Supabase SQL Editor, then rerun: npm run setup:supabase"
      )
    }
    throw upsertError
  }

  console.log(`Supabase admin initialized: ${adminEmail}`)
}

main().catch((error) => {
  console.error("Failed to setup Supabase admin:", error.message)
  process.exit(1)
})
