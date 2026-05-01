export type InformationCollateral = {
  id: string
  documentName: string
  collateralType: string
  /** Google Drive “view” share link — opens in the Drive viewer */
  driveUrl: string
}

/** Extract file id from a Drive `/file/d/<id>/...` URL */
export function googleDriveFileIdFromUrl(url: string): string | null {
  const match = url.match(/\/file\/d\/([^/?#]+)/)
  return match?.[1] ?? null
}

/**
 * Browser-view URL for shared Drive files.
 * Opens file content directly (PDF/image viewer) instead of Drive UI when possible.
 */
export function googleDriveBrowserViewUrl(viewUrl: string): string {
  const id = googleDriveFileIdFromUrl(viewUrl)
  if (!id) return viewUrl
  return `https://drive.google.com/uc?export=view&id=${id}`
}

export const INFORMATION_COLLATERALS: InformationCollateral[] = [
  {
    id: "post-op-albification",
    documentName: "Post-op instruction — Albification process",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/1xR_-I4GxFDv8FNYEuGg1s4Xo0dFWF-GE/view?usp=sharing",
  },
  {
    id: "post-op-crown-bridge",
    documentName: "Post-op instructions for Crown and Bridge",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/16GnyyFKFA-qjB0qo3uLxdjvcLmI-Hcmv/view?usp=sharing",
  },
  {
    id: "post-op-dentures",
    documentName: "Post-op instructions for Dentures",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/1dmLMSG3oyalQYvlkDN5UXkl3sqTIu505/view?usp=sharing",
  },
  {
    id: "post-op-extraction",
    documentName: "Post-op instructions for Extraction",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/1_RbHy9bwcpTu3sn22m0eHT-w7cNUqNbz/view?usp=sharing",
  },
  {
    id: "post-op-fillings",
    documentName: "Post-op instructions for Fillings",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/1lFsL2dB7f1zEIRcl6L6atK_Ru6NLjxOR/view?usp=sharing",
  },
  {
    id: "post-op-implant",
    documentName: "Post-op instructions for Implant Surgery",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/1K9bpZcPtQiGKbmg7DhZN2Owbek0BJlac/view?usp=sharing",
  },
  {
    id: "post-op-periodontal",
    documentName: "Post-op instructions for Periodontal Surgery",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/1y5KDeEkOkwXN_UdYSyvWswJdxLoIMA5R/view?usp=sharing",
  },
  {
    id: "post-op-root-canal",
    documentName: "Post-op instructions for Root Canal Therapy",
    collateralType: "Ready Reckoner",
    driveUrl:
      "https://drive.google.com/file/d/1Mm_ghnPnwWhMF1K5h7JK0citMdvW0aPK/view?usp=sharing",
  },
]

export function uniqueCollateralTypes(rows: InformationCollateral[]) {
  return [...new Set(rows.map((r) => r.collateralType))].sort()
}
