export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServiceData {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  heroImage: string;
  accentColor: string;
  intro: string;
  benefits: string[];
  process: { step: string; desc: string }[];
  faqs: ServiceFAQ[];
  metaDescription: string;
}

export const services: ServiceData[] = [
  {
    slug: "smile-designing",
    name: "Smile Designing",
    tagline: "Your perfect smile, crafted to fit your face.",
    icon: "/svgs/white-teeth.png",
    heroImage: "https://images.pexels.com/photos/3762453/pexels-photo-3762453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Bespoke smile makeovers at MySmile Luxe Dental Lounge, Gachibowli. Personalised to your face, teeth and personality.",
    intro:
      "Smile designing is the art and science of crafting a smile that is uniquely yours. At MySmile Luxe Dental Lounge, we combine digital smile analysis, high-end cosmetic techniques, and meticulous craftsmanship to design a smile that enhances your natural features — not just your teeth.",
    benefits: [
      "Fully personalised to your facial structure and skin tone",
      "Combines veneers, whitening, contouring and more in one cohesive plan",
      "Digital preview before any treatment begins",
      "Long-lasting, natural-looking results",
      "Boosts confidence and transforms first impressions",
    ],
    process: [
      { step: "Smile Analysis", desc: "We photograph and analyse your face, teeth shape, gum line and bite to understand what will look most natural on you." },
      { step: "Digital Mock-up", desc: "A digital preview of your new smile is created so you can see and approve the final look before any treatment." },
      { step: "Treatment Planning", desc: "We map out the combination of procedures — veneers, whitening, contouring or more — and walk you through every step." },
      { step: "Execution", desc: "Treatments are carried out in a phased, comfortable manner using the finest materials and technology." },
      { step: "Final Review", desc: "We review the outcome together and make any fine adjustments to ensure you love your new smile." },
    ],
    faqs: [
      { q: "How long does a smile makeover take?", a: "Depending on the procedures involved, most smile designs are completed in 2–4 visits spread over a few weeks." },
      { q: "Is smile designing painful?", a: "No. We use gentle anaesthesia and minimally invasive techniques to ensure your comfort throughout." },
      { q: "How long will my new smile last?", a: "With proper care, a smile design can last 10–15 years. We guide you on maintenance at every stage." },
      { q: "Can I see a preview before starting?", a: "Yes — we always provide a digital mock-up so you can visualise the end result and request changes before treatment." },
    ],
  },
  {
    slug: "veneers",
    name: "Veneers",
    tagline: "Ultra-thin. Flawless. Completely natural.",
    icon: "/svgs/protection.png",
    heroImage: "https://images.pexels.com/photos/6627284/pexels-photo-6627284.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Porcelain and composite veneers at MySmile Luxe Dental Lounge, Gachibowli. Natural-looking, minimally invasive, long-lasting.",
    intro:
      "Dental veneers are wafer-thin shells of porcelain or composite resin bonded to the front surface of your teeth. They are the fastest way to correct chips, cracks, discolouration, gaps, and uneven teeth — all without extensive drilling. At MySmile, every veneer is custom-crafted in a premium lab for a fit and shade that is indistinguishable from natural enamel.",
    benefits: [
      "Minimal tooth preparation — preserves maximum natural structure",
      "Stain-resistant porcelain for lasting brightness",
      "Corrects chips, cracks, gaps and discolouration in one step",
      "Custom shaded to match or brighten your smile",
      "Results that look and feel completely natural",
    ],
    process: [
      { step: "Consultation", desc: "We assess your teeth, discuss your goals and confirm veneers are the right choice for you." },
      { step: "Preparation", desc: "A thin layer of enamel is gently removed to allow the veneer to sit flush with surrounding teeth." },
      { step: "Impression", desc: "A precise impression is taken and sent to our premium dental lab for fabrication." },
      { step: "Temporary Veneers", desc: "Temporary veneers protect your teeth while your permanent ones are being crafted." },
      { step: "Bonding", desc: "The final veneers are carefully bonded using high-strength dental adhesive and cured with a special light." },
    ],
    faqs: [
      { q: "How long do porcelain veneers last?", a: "With good oral hygiene, porcelain veneers typically last 10–20 years." },
      { q: "Are veneers reversible?", a: "Since a thin layer of enamel is removed, veneers are considered permanent. We always ensure you are fully informed before proceeding." },
      { q: "Will veneers look fake?", a: "Never. Our veneers are custom shade-matched and crafted by skilled technicians to look completely natural." },
      { q: "Do veneers stain?", a: "Porcelain veneers are highly stain-resistant. Composite veneers may require periodic polishing." },
    ],
  },
  {
    slug: "teeth-whitening",
    name: "Teeth Whitening",
    tagline: "Brighter smile. One visit. Zero sensitivity.",
    icon: "/svgs/sensitive.png",
    heroImage: "https://images.pexels.com/photos/5622271/pexels-photo-5622271.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Professional in-clinic teeth whitening at MySmile Luxe Dental Lounge, Gachibowli. Visibly brighter in under an hour.",
    intro:
      "Professional teeth whitening at MySmile Luxe Dental Lounge delivers results that over-the-counter products simply cannot match. Our clinical-grade whitening system lightens teeth by several shades in a single session — with minimal to no sensitivity — leaving you with a genuinely radiant, natural-looking smile.",
    benefits: [
      "Up to 8 shades brighter in one in-clinic session",
      "Safe, controlled application by dental professionals",
      "Minimal sensitivity with our advanced formula",
      "Results that last 1–3 years with proper care",
      "Take-home kits available for ongoing maintenance",
    ],
    process: [
      { step: "Shade Assessment", desc: "We photograph your current tooth shade to document your baseline and track the improvement." },
      { step: "Gum Protection", desc: "Your gums are shielded with a protective barrier before any whitening gel is applied." },
      { step: "Gel Application", desc: "Professional-grade whitening gel is carefully applied to your teeth." },
      { step: "Activation", desc: "A specially calibrated light activates the gel, accelerating the whitening process." },
      { step: "Post-care Advice", desc: "We guide you on diet and habits to maximise and maintain your results." },
    ],
    faqs: [
      { q: "How long do whitening results last?", a: "Results typically last 1–3 years depending on diet and oral hygiene habits." },
      { q: "Is teeth whitening safe?", a: "Yes. When performed by a dental professional, teeth whitening is safe and controlled." },
      { q: "Will whitening work on crowns or veneers?", a: "Whitening only affects natural teeth. We account for this during treatment planning." },
      { q: "What should I avoid after whitening?", a: "For 48 hours after treatment, avoid coffee, tea, red wine and coloured foods for the best results." },
    ],
  },
  {
    slug: "cosmetic-fillings",
    name: "Cosmetic Fillings",
    tagline: "Repair your tooth. Nobody will ever know.",
    icon: "/svgs/bad-teeth.png",
    heroImage: "https://images.pexels.com/photos/3845759/pexels-photo-3845759.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Tooth-coloured composite fillings at MySmile Luxe Dental Lounge, Gachibowli. Invisible, durable, and mercury-free.",
    intro:
      "Gone are the days of dark metal fillings. At MySmile Luxe Dental Lounge, we use advanced composite resin that is precisely shade-matched to your teeth, making repairs completely invisible. Our cosmetic fillings are mercury-free, bond directly to the tooth, and are completed in a single comfortable visit.",
    benefits: [
      "Shade-matched to blend seamlessly with natural teeth",
      "Mercury-free and biocompatible",
      "Bonds to tooth structure — less drilling required",
      "Completed in a single visit",
      "Suitable for front and back teeth",
    ],
    process: [
      { step: "Examination", desc: "We assess the cavity or damage and confirm a composite filling is the right solution." },
      { step: "Shade Matching", desc: "We select the composite shade that perfectly matches your surrounding teeth." },
      { step: "Preparation", desc: "The decayed or damaged area is removed with minimal impact on healthy tooth structure." },
      { step: "Bonding & Shaping", desc: "The composite is applied in layers, shaped to match the natural contour of your tooth, and hardened with a curing light." },
      { step: "Polish", desc: "The filling is polished to a smooth, natural finish that is indistinguishable from the rest of your tooth." },
    ],
    faqs: [
      { q: "How long do composite fillings last?", a: "With good care, cosmetic fillings last 7–10 years. Front tooth fillings may need refreshing sooner due to aesthetic wear." },
      { q: "Can old metal fillings be replaced?", a: "Yes. We can safely remove old amalgam fillings and replace them with tooth-coloured composites." },
      { q: "Is getting a filling painful?", a: "No. The area is numbed before treatment so you remain comfortable throughout." },
      { q: "Can I eat after a filling?", a: "You can eat after the anaesthesia wears off — usually within 1–2 hours. Avoid very hard foods for 24 hours." },
    ],
  },
  {
    slug: "dental-implants",
    name: "Dental Implants",
    tagline: "Permanent teeth. Natural feel. Lifetime confidence.",
    icon: "/svgs/dental-implant.png",
    heroImage: "https://images.pexels.com/photos/4687905/pexels-photo-4687905.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Premium dental implants at MySmile Luxe Dental Lounge, Gachibowli. Permanent, natural-looking tooth replacement with expert placement.",
    intro:
      "Dental implants are the gold standard for replacing missing teeth. A titanium post is placed into the jawbone, fusing with it over time to create a permanent root. The implant is then crowned with a custom porcelain tooth that looks, feels and functions exactly like a natural tooth — and can last a lifetime with proper care.",
    benefits: [
      "Looks, feels and functions like a natural tooth",
      "Preserves jawbone and prevents facial sagging",
      "No impact on adjacent teeth (unlike bridges)",
      "Can last a lifetime with proper care",
      "Restores full chewing ability and speech",
    ],
    process: [
      { step: "Assessment & Planning", desc: "A detailed X-ray and 3D scan evaluate bone density and map the optimal implant position." },
      { step: "Implant Placement", desc: "Under local anaesthesia, the titanium post is precisely placed into the jawbone." },
      { step: "Healing (Osseointegration)", desc: "Over 3–6 months, the implant fuses with the bone, creating a strong permanent foundation." },
      { step: "Abutment Fitting", desc: "A small connector (abutment) is attached to the implant to hold the final crown." },
      { step: "Crown Placement", desc: "A custom-shaded porcelain crown is fixed onto the abutment, completing your new tooth." },
    ],
    faqs: [
      { q: "Am I a candidate for implants?", a: "Most adults with healthy gums and sufficient jawbone are good candidates. We assess this thoroughly before recommending implants." },
      { q: "How painful is the implant procedure?", a: "The procedure is done under local anaesthesia. Most patients report less discomfort than they expected." },
      { q: "How long do implants last?", a: "With good oral hygiene, implants can last a lifetime. The porcelain crown may need replacing after 15–20 years." },
      { q: "Can I have multiple implants?", a: "Yes. We place single implants, implant-supported bridges, and full-arch implant solutions depending on your needs." },
    ],
  },
  {
    slug: "crowns-and-bridges",
    name: "Crowns & Bridges",
    tagline: "Restore strength. Rebuild your smile.",
    icon: "/svgs/dental-prosthesis.png",
    heroImage: "https://images.pexels.com/photos/6502345/pexels-photo-6502345.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Custom dental crowns and bridges at MySmile Luxe Dental Lounge, Gachibowli. Durable, natural-looking tooth restoration.",
    intro:
      "Dental crowns cap and protect severely damaged or weakened teeth, restoring their shape, strength and appearance. Bridges use crowns on either side of a gap to support a false tooth in between, replacing missing teeth without implants. At MySmile, all crowns and bridges are crafted from premium ceramic for unmatched aesthetics and durability.",
    benefits: [
      "Protects weak or cracked teeth from further damage",
      "Restores full chewing function",
      "Replaces missing teeth without surgery (bridges)",
      "Lifelike ceramic crafted to match natural teeth",
      "Long-lasting — 10–15 years or more with care",
    ],
    process: [
      { step: "Assessment", desc: "We examine the tooth and determine whether a crown, bridge or alternative is best." },
      { step: "Tooth Preparation", desc: "The damaged tooth is shaped to create space for the crown to fit over it." },
      { step: "Impression", desc: "A precise impression is taken and sent to our lab for custom fabrication." },
      { step: "Temporary Crown", desc: "A temporary crown protects your tooth while the permanent one is being made." },
      { step: "Cementation", desc: "The final crown or bridge is checked for fit and shade, then permanently cemented in place." },
    ],
    faqs: [
      { q: "How long do crowns last?", a: "With good care, dental crowns last 10–20 years. Regular check-ups help us monitor their condition." },
      { q: "Is getting a crown painful?", a: "No. The tooth is numbed before preparation. Some mild soreness after may occur, which settles quickly." },
      { q: "What is the difference between a crown and a bridge?", a: "A crown covers a single existing tooth. A bridge uses crowns on adjacent teeth to hold a replacement for a missing tooth in between." },
      { q: "Can crowns be tooth-coloured?", a: "Yes. We exclusively use tooth-coloured ceramic crowns for natural aesthetics." },
    ],
  },
  {
    slug: "bps-dentures",
    name: "BPS Dentures",
    tagline: "Comfort and confidence. Every single day.",
    icon: "/svgs/broken-tooth.png",
    heroImage: "https://images.pexels.com/photos/5355826/pexels-photo-5355826.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "BPS precision dentures at MySmile Luxe Dental Lounge, Gachibowli. Superior fit, comfort and aesthetics for full or partial tooth replacement.",
    intro:
      "BPS (Biofunctional Prosthetic System) dentures are premium, precision-crafted removable prosthetics that offer a superior fit, function and appearance compared to conventional dentures. At MySmile Luxe Dental Lounge, every BPS denture is individually designed to suit your bite, facial structure and aesthetic preferences.",
    benefits: [
      "Precision fit using the BPS functional impression system",
      "More stable and comfortable than conventional dentures",
      "Natural appearance with lifelike tooth and gum aesthetics",
      "Improved chewing efficiency and speech",
      "Available as full or partial dentures",
    ],
    process: [
      { step: "Consultation & Records", desc: "We record jaw measurements, facial proportions and your bite relationship." },
      { step: "Custom Impression", desc: "A functional impression captures your mouth's unique shape for a precise fit." },
      { step: "Wax Try-in", desc: "A wax model lets you preview the fit, shape and appearance before finalisation." },
      { step: "Denture Fabrication", desc: "Your dentures are precision-crafted in a BPS-certified lab using premium materials." },
      { step: "Fitting & Adjustment", desc: "We fit the dentures and make any comfort adjustments to ensure a perfect result." },
    ],
    faqs: [
      { q: "How are BPS dentures different from regular dentures?", a: "BPS dentures use a more precise functional impression technique and superior materials, resulting in better fit, stability and appearance." },
      { q: "How long does it take to get dentures?", a: "The entire process typically takes 4–6 weeks across multiple appointments." },
      { q: "Will dentures affect my speech?", a: "There is a brief adjustment period. Most patients adapt within a few weeks and speak naturally." },
      { q: "How do I care for my dentures?", a: "Brush them daily with a soft brush, soak overnight in a denture solution, and handle carefully to avoid drops." },
    ],
  },
  {
    slug: "full-mouth-rehab",
    name: "Full Mouth Rehab",
    tagline: "Comprehensive restoration. Total transformation.",
    icon: "/svgs/medical-assistance.png",
    heroImage: "https://images.pexels.com/photos/7788511/pexels-photo-7788511.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Full mouth rehabilitation at MySmile Luxe Dental Lounge, Gachibowli. Comprehensive treatment to restore function, health and aesthetics.",
    intro:
      "Full mouth rehabilitation is a comprehensive treatment plan that addresses all dental concerns simultaneously — restoring function, health and aesthetics across the entire mouth. It combines restorative, cosmetic and sometimes surgical procedures in a coordinated sequence, planned and executed by our expert team.",
    benefits: [
      "Addresses all dental concerns in a single coordinated plan",
      "Restores chewing function, speech and jaw comfort",
      "Eliminates pain, sensitivity and bite problems",
      "Dramatic aesthetic transformation alongside health benefits",
      "Customised timeline and phased treatment for your comfort",
    ],
    process: [
      { step: "Comprehensive Assessment", desc: "A full dental and jaw examination, X-rays, photos and models give us a complete picture of your oral health." },
      { step: "Treatment Planning", desc: "We design a detailed, sequenced treatment plan tailored to your unique situation and goals." },
      { step: "Phase 1 – Foundation", desc: "Decay, infection and gum disease are treated first to create a stable foundation." },
      { step: "Phase 2 – Restoration", desc: "Damaged teeth are rebuilt using crowns, bridges, implants or other restorations." },
      { step: "Phase 3 – Aesthetics", desc: "Finishing touches such as whitening, veneers or contouring complete your transformation." },
    ],
    faqs: [
      { q: "How long does full mouth rehab take?", a: "Depending on the complexity, treatment typically spans 3–12 months across multiple visits." },
      { q: "Is full mouth rehab expensive?", a: "Costs vary by treatment scope. We provide a full itemised breakdown and discuss phasing options to suit your budget." },
      { q: "Will I be without teeth during treatment?", a: "No. We ensure you have functional, aesthetic temporary solutions throughout the entire process." },
      { q: "Am I a candidate for full mouth rehab?", a: "Anyone with multiple dental issues — decay, missing teeth, bite problems, worn teeth — is a potential candidate. Book a consultation and we will assess your needs." },
    ],
  },
  {
    slug: "teeth-cleaning",
    name: "Teeth Cleaning",
    tagline: "Fresh mouth. Healthy gums. Lasting smile.",
    icon: "/svgs/dental-care.png",
    heroImage: "https://images.pexels.com/photos/3845744/pexels-photo-3845744.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Professional teeth cleaning and scaling at MySmile Luxe Dental Lounge, Gachibowli. Remove tartar, prevent gum disease, brighten your smile.",
    intro:
      "Professional teeth cleaning (scaling and polishing) removes the hardened tartar and plaque that your toothbrush simply cannot reach. At MySmile Luxe Dental Lounge, our hygiene appointments are thorough, gentle and paired with personalised advice to keep your teeth and gums healthy between visits.",
    benefits: [
      "Removes tartar build-up that brushing cannot address",
      "Prevents gum disease and tooth decay",
      "Leaves teeth visibly cleaner and brighter",
      "Fresh breath that lasts",
      "Early detection of any developing dental issues",
    ],
    process: [
      { step: "Oral Examination", desc: "We check your teeth and gums for any signs of decay, gum disease or other concerns." },
      { step: "Scaling", desc: "Ultrasonic and manual instruments remove hardened tartar from above and below the gum line." },
      { step: "Polishing", desc: "A gentle polishing paste removes surface stains and smooths the enamel surface." },
      { step: "Flossing", desc: "Interdental cleaning removes plaque and debris from between the teeth." },
      { step: "Personalised Advice", desc: "We advise on brushing technique, flossing, and diet to maintain your results at home." },
    ],
    faqs: [
      { q: "How often should I get my teeth cleaned?", a: "We recommend professional cleaning every 6 months. Some patients with gum disease may need quarterly visits." },
      { q: "Is scaling painful?", a: "Scaling can feel slightly uncomfortable but is rarely painful. For sensitive patients we can apply a topical numbing gel." },
      { q: "Will cleaning whiten my teeth?", a: "Cleaning removes surface stains and tartar, noticeably brightening teeth. For deeper whitening, we offer professional whitening treatments." },
      { q: "Does cleaning damage enamel?", a: "No. Professional cleaning is safe and actually protects enamel by removing acidic bacterial deposits." },
    ],
  },
  {
    slug: "painless-root-canals",
    name: "Painless Root Canals",
    tagline: "2,000+ cases. Single visit. Absolutely pain-free.",
    icon: "/svgs/infection.png",
    heroImage: "https://images.pexels.com/photos/7800562/pexels-photo-7800562.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Painless root canal treatment at MySmile Luxe Dental Lounge, Gachibowli. Single-visit, rotary endodontics with 2,000+ successful cases.",
    intro:
      "The words 'root canal' carry an undeserved reputation. Modern rotary endodontics, performed by our specialist Dr. Shridha Prabhu with over 2,000 successful cases, is no more uncomfortable than getting a filling. We treat infected teeth in a single visit, saving your natural tooth and eliminating pain — permanently.",
    benefits: [
      "Completely eliminates toothache and infection",
      "Saves your natural tooth — no extraction needed",
      "Single-visit completion using rotary endodontics",
      "Gentle technique with proven zero-pain protocol",
      "Followed by a crown to restore full strength",
    ],
    process: [
      { step: "Diagnosis", desc: "X-rays confirm the extent of infection and root anatomy to plan the treatment precisely." },
      { step: "Anaesthesia", desc: "The tooth is completely numbed so you feel nothing throughout the procedure." },
      { step: "Pulp Removal", desc: "Infected tissue from inside the tooth is removed using precision rotary instruments." },
      { step: "Canal Shaping & Cleaning", desc: "The root canals are cleaned, shaped and disinfected to eliminate all bacteria." },
      { step: "Sealing & Crown", desc: "The canals are sealed with a biocompatible material and a crown is placed to protect and restore the tooth." },
    ],
    faqs: [
      { q: "Will a root canal hurt?", a: "No. With modern anaesthesia and our gentle technique, the procedure is completely pain-free for the vast majority of patients." },
      { q: "How long does a root canal take?", a: "Most cases are completed in a single visit of 60–90 minutes." },
      { q: "Do I need a crown after a root canal?", a: "Yes. A crown is strongly recommended to protect the treated tooth from fracture and restore full chewing function." },
      { q: "Why save a tooth with a root canal instead of extracting it?", a: "Saving your natural tooth is always preferable. It preserves jawbone, maintains neighbouring tooth position, and avoids the cost of implants or dentures." },
    ],
  },
  {
    slug: "surgical-extractions",
    name: "Surgical Extractions",
    tagline: "Expert removal. Minimal recovery. Expert aftercare.",
    icon: "/svgs/tooth-extraction.png",
    heroImage: "https://images.pexels.com/photos/4687401/pexels-photo-4687401.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Surgical tooth extractions including wisdom teeth at MySmile Luxe Dental Lounge, Gachibowli. Gentle, expert removal with minimal downtime.",
    intro:
      "When a tooth cannot be saved, surgical extraction is performed with the highest level of care and precision at MySmile Luxe Dental Lounge. Whether it is an impacted wisdom tooth or a severely damaged tooth, our gentle surgical approach ensures minimal discomfort, fast healing, and thorough aftercare guidance.",
    benefits: [
      "Experienced surgeon for complex and impacted cases",
      "Minimal trauma technique for faster recovery",
      "Full aftercare and follow-up support",
      "Impacted wisdom tooth removal with ease",
      "Post-extraction options discussed (implants, bridges)",
    ],
    process: [
      { step: "Assessment & X-ray", desc: "We take a detailed X-ray to understand the tooth's root structure and plan the extraction safely." },
      { step: "Anaesthesia", desc: "Local anaesthesia fully numbs the area so you feel no pain during the procedure." },
      { step: "Surgical Removal", desc: "The tooth is carefully sectioned if needed and removed with precision instruments to minimise trauma to surrounding tissue." },
      { step: "Socket Care", desc: "The socket is cleaned and a clot is encouraged to form for proper healing." },
      { step: "Aftercare Guidance", desc: "Detailed instructions on diet, hygiene and healing are provided, along with a follow-up appointment." },
    ],
    faqs: [
      { q: "Is tooth extraction painful?", a: "The area is fully numbed before extraction. You will feel pressure but no pain. Post-procedure discomfort is managed with prescribed medication." },
      { q: "How long is recovery?", a: "Most patients recover fully within 3–7 days. Wisdom tooth removal may require a slightly longer recovery." },
      { q: "What should I eat after an extraction?", a: "Stick to soft foods for 24–48 hours and avoid hot drinks, straws and smoking to protect the healing socket." },
      { q: "Do I need to replace the extracted tooth?", a: "For most teeth, replacement is advisable to prevent shifting and bone loss. We discuss implants, bridges and other options with you." },
    ],
  },
  {
    slug: "laser-dentistry",
    name: "Laser Dentistry",
    tagline: "Precise. Gentle. Modern dental care at its finest.",
    icon: "/svgs/dentalchair.webp",
    heroImage: "https://images.pexels.com/photos/6629416/pexels-photo-6629416.jpeg?auto=compress&cs=tinysrgb&w=1200",
    accentColor: "#c9a84c",
    metaDescription: "Advanced laser dentistry at MySmile Luxe Dental Lounge, Gachibowli. Gum treatments, cavity removal and whitening with minimal discomfort.",
    intro:
      "Laser dentistry represents the cutting edge of modern dental care. At MySmile Luxe Dental Lounge, we use advanced dental lasers for a range of procedures — from gum reshaping and cavity treatment to teeth whitening and bacterial elimination. Lasers mean less drilling, less bleeding, faster healing and a more comfortable experience.",
    benefits: [
      "Minimally invasive — often no drilling required",
      "Reduced bleeding and swelling",
      "Faster healing compared to conventional methods",
      "Precisely targets treatment areas without affecting healthy tissue",
      "Suitable for patients with dental anxiety",
    ],
    process: [
      { step: "Assessment", desc: "We determine which laser procedure is right for your specific concern." },
      { step: "Preparation", desc: "The area is prepared and protective eyewear is provided for both patient and clinician." },
      { step: "Laser Treatment", desc: "The dental laser is precisely applied to the treatment site, vaporising or ablating tissue with minimal contact." },
      { step: "Healing", desc: "Laser-treated areas heal faster due to reduced trauma and the laser's natural sterilising effect." },
      { step: "Post-treatment Care", desc: "We guide you on care for the treated area to ensure comfortable and complete healing." },
    ],
    faqs: [
      { q: "What can laser dentistry treat?", a: "Lasers are used for gum reshaping, treating gum disease, removing decay, biopsies, aphthous ulcer relief, and enhancing whitening." },
      { q: "Is laser treatment painful?", a: "Most laser procedures require little to no anaesthesia and cause minimal discomfort." },
      { q: "Is laser dentistry safe?", a: "Yes. Dental lasers are FDA-approved and have an excellent safety record when used by trained clinicians." },
      { q: "How long does laser treatment take?", a: "Depending on the procedure, laser treatments typically take 30–60 minutes." },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return services.find((s) => s.slug === slug);
}
