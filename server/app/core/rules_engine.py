from typing import Dict, Any, List, Tuple

RED_FLAG_PATTERNS = [
    {
        "id": "CARDIAC_RED_FLAG",
        "keywords": ["chest pain", "substernal", "seene mein dard", "छाती में दर्द", "छातीत दुखणे", "sweating", "breathlessness", "radiation to arm", "radiation to jaw"],
        "min_matches": 2,
        "priority": "RED_FLAG",
        "reason": "Substernal Chest Discomfort & Autonomic Symptoms (Rule out Acute Coronary Syndrome)"
    },
    {
        "id": "STROKE_RED_FLAG",
        "keywords": ["facial drooping", "arm weakness", "slurred speech", "sudden numbness", "balance loss"],
        "min_matches": 1,
        "priority": "RED_FLAG",
        "reason": "Sudden Neurological Deficit (FAST Stroke Protocol Triggered)"
    },
    {
        "id": "ACUTE_ABDOMEN_RED_FLAG",
        "keywords": ["severe abdominal pain", "vomiting blood", "black stool", "fainting", "rigid abdomen"],
        "min_matches": 2,
        "priority": "RED_FLAG",
        "reason": "Acute Severe Abdominal Discomfort (Rule out Gastrointestinal Perforation / Bleed)"
    }
]

QUESTION_BANK = [
    {
        "step": 1,
        "id": "CHIEF_COMPLAINT_LOCALIZATION",
        "section_title": {"hi": "1. मुख्य लक्षण एवं स्थान (SOCRATES Site)", "mr": "1. मुख्य लक्षण", "en": "1. Site & Primary Symptom"},
        "question_text": {
            "hi": "आपको दर्द या असहजता किस स्थान पर महसूस हो रही है?",
            "mr": "तुम्हाला नक्की कुठे वेदना किंवा त्रास होत आहे?",
            "en": "Where exactly do you feel the pain or discomfort?"
        },
        "input_type": "VOICE_AND_TOUCH",
        "options": [
            {"value": "Chest", "label": {"hi": "छाती / हृदय क्षेत्र", "mr": "छाती / हृदय क्षेत्र", "en": "Chest"}},
            {"value": "Upper Abdomen", "label": {"hi": "पेट का ऊपरी भाग / आमाशय", "mr": "पोटाचा वरचा भाग / आमाशय", "en": "Upper Abdomen"}},
            {"value": "Lower Abdomen", "label": {"hi": "नाभि के नीचे / बस्ती क्षेत्र", "mr": "पहिल्या खालील भाग", "en": "Lower Abdomen"}},
            {"value": "Back & Spine", "label": {"hi": "पीठ, कमर और मेरुदंड", "mr": "पाठ आणि कंबर", "en": "Back & Spine"}},
            {"value": "Joints & Limbs", "label": {"hi": "जोड़ों में दर्द / हाथ-पैर", "mr": "सांधे आणि हात-पाय", "en": "Joints & Limbs"}},
            {"value": "Other Location", "label": {"hi": "सिर, गला अथवा अन्य स्थान", "mr": "इतर भाग", "en": "Other Location"}}
        ]
    },
    {
        "step": 2,
        "id": "SYMPTOM_ONSET_TIME_COURSE",
        "section_title": {"hi": "2. शुरुआत एवं समय (SOCRATES Onset)", "mr": "2. लक्षण कालावधी", "en": "2. Onset & Time Course"},
        "question_text": {
            "hi": "यह दर्द कब और कैसे शुरू हुआ? कितने समय से हो रहा है?",
            "mr": "हा त्रास कधी आणि कसा सुरू झाला?",
            "en": "When and how did this symptom begin?"
        },
        "input_type": "VOICE_AND_TOUCH",
        "options": [
            {"value": "Sudden Onset (~18 hrs / yesterday evening)", "label": {"hi": "अचानक कल शाम से (18-24 घंटे)", "mr": "काल संध्याकाळपासून", "en": "Sudden (~18 hrs)"}},
            {"value": "Gradual (3-5 Days)", "label": {"hi": "धीरे-धीरे 3 से 5 दिनों से", "mr": "३ ते ५ दिवस", "en": "Gradual (3-5 Days)"}},
            {"value": "Chronic (2 Weeks+)", "label": {"hi": "पुराना (2 सप्ताह से अधिक)", "mr": "२ आठवड्यांपेक्षा जास्त", "en": "Chronic (2+ Weeks)"}}
        ]
    },
    {
        "step": 3,
        "id": "CHARACTER_AND_SEVERITY",
        "section_title": {"hi": "3. दर्द की प्रकृति एवं तीव्रता (SOCRATES Character & Severity)", "mr": "3. वेदना स्वरूप", "en": "3. Character & Severity"},
        "question_text": {
            "hi": "दर्द का प्रकार कैसा है और तीव्रता 1 से 10 के पैमाने पर कितनी है?",
            "mr": "वेदना कशा प्रकारच्या आहेत?",
            "en": "What does the pain feel like, and how severe is it (1-10)?"
        },
        "input_type": "VOICE_AND_TOUCH",
        "options": [
            {"value": "Severe Burning / Pyrosis (8/10)", "label": {"hi": "तेज जलन / अम्लपित्त (8/10)", "mr": "तीव्र दाह (८/१०)", "en": "Severe Burning (8/10)"}},
            {"value": "Dull Aching / Heavy Pressure (6/10)", "label": {"hi": "भारीपन / मीठा दर्द (6/10)", "mr": "जडपणा / मंद वेदना", "en": "Dull Heavy Pressure"}},
            {"value": "Sharp Stabbing Pain (9/10)", "label": {"hi": "तेज चुभन जैसा दर्द (9/10)", "mr": "तीव्र टोचल्यासारखी वेदना", "en": "Sharp Stabbing (9/10)"}}
        ]
    },
    {
        "step": 4,
        "id": "RADIATION_ASSOCIATED_SYMPTOMS",
        "section_title": {"hi": "4. फैलाव एवं सह-लक्षण (SOCRATES Radiation & Associated)", "mr": "4. सह-लक्षणे", "en": "4. Radiation & Associated Symptoms"},
        "question_text": {
            "hi": "क्या दर्द कहीं फैलता है, या साथ में पसीना, सांस फूलना या खट्टी डकारें आ रही हैं?",
            "mr": "वेदना कुठे पसरतात का किंवा घाम/उलटी/आंबट ढेकर येतात का?",
            "en": "Does the pain radiate anywhere, or are there associated symptoms like sweating or acidic burps?"
        },
        "input_type": "VOICE_AND_TOUCH",
        "options": [
            {"value": "Acidic Regurgitation & Sour Burps (Vidagdha Amlodgara)", "label": {"hi": "खट्टी डकारें व गले में जलन (Amlapitta)", "mr": "आंबट ढेकर व छातीत जळजळ", "en": "Acidic Burps & Regurgitation"}},
            {"value": "Radiation to Arm/Jaw + Sweating", "label": {"hi": "बाएँ हाथ/जबड़े में दर्द + पसीना", "mr": "डाव्या हातात वेदना + घाम", "en": "Radiation to Arm/Jaw + Sweating"}},
            {"value": "Nausea & Abdominal Bloating", "label": {"hi": "जी मिचलाना व पेट फूलना", "mr": "मळमळ व पोट फुगणे", "en": "Nausea & Bloating"}}
        ]
    },
    {
        "step": 5,
        "id": "AGGRAVATING_RELIEVING_FACTORS",
        "section_title": {"hi": "5. बढ़ाने व घटाने वाले कारक (SOCRATES Exacerbating/Relieving)", "mr": "5. वाढवणारे घटक", "en": "5. Aggravating & Relieving Factors"},
        "question_text": {
            "hi": "क्या भोजन करने (मसालेदार/तला खाना) के बाद जलन बढ़ती है, और क्या गरम पानी या दूध पीने से आराम मिलता है?",
            "mr": "जेवणानंतर दाह वाढतो का?",
            "en": "Does discomfort worsen after spicy/fried food, and does warm water/milk relieve it?"
        },
        "input_type": "VOICE_AND_TOUCH",
        "options": [
            {"value": "Worse Post-Meal (Deep Fried/Spicy Feast)", "label": {"hi": "हाँ, तली-मसालेदार चीज़ों से बढ़ता है", "mr": "होय, तिखट खाल्ल्यावर वाढतो", "en": "Worse Post-Meal / Fried Food"}},
            {"value": "Relieved by Warm Water / Milk", "label": {"hi": "गरम पानी/दूध से अस्थायी आराम", "mr": "कोमट पाण्याने थोडा आराम", "en": "Relieved by Warm Water/Milk"}},
            {"value": "Worse on Exertion", "label": {"hi": "चलने-फिरने पर बढ़ता है", "mr": "चालल्यावर वाढतो", "en": "Worse on Exertion"}}
        ]
    },
    {
        "step": 6,
        "id": "AYUSH_DASHAVIDHA_PARIKSHA",
        "section_title": {"hi": "6. आयुर्वेद दशविध परीक्षा (AYUSH Dashavidha Assessment)", "mr": "6. दशविध परीक्षा", "en": "6. AYUSH Dashavidha Pariksha"},
        "question_text": {
            "hi": "अपनी भूख (Agni), कोष्ठ (Bowel), एवं प्रकृति (Pitta/Vata/Kapha) स्वभाव का चयन करें:",
            "mr": "तुमची भूक आणि पचन स्वभाव निवडा:",
            "en": "Select your appetite (Agni), bowel nature (Koshtha), and Prakriti traits:"
        },
        "input_type": "TOUCH_ONLY",
        "options": [
            {"value": "Tikshnagni + Krura Koshtha (Pitta 58% Vata 32%)", "label": {"hi": "तीव्र भूख + खट्टी डकारें + कड़ा मल (Tikshnagni/Pitta-Vata)", "mr": "तीव्र भूक + कडक संडास (Pitta-Vata)", "en": "Tikshnagni (Pitta-Vata)"}},
            {"value": "Mandagni + Mridu Koshtha (Kapha 60%)", "label": {"hi": "कम भूख + पेट भारी रहना (Mandagni/Kapha)", "mr": "मंद भूक (Kapha)", "en": "Mandagni (Kapha Dominance)"}},
            {"value": "Vishamagni + Irregular Bowel (Vata 65%)", "label": {"hi": "अनियमित भूख व कब्ज (Vishamagni/Vata)", "mr": "अनियमित भूक (Vata)", "en": "Vishamagni (Vata Dominance)"}}
        ]
    }
]

def evaluate_red_flags(answers_text: str) -> Tuple[str, List[Dict[str, Any]]]:
    detected_flags = []
    highest_priority = "NORMAL"
    lowered = answers_text.lower()

    for pattern in RED_FLAG_PATTERNS:
        match_count = sum(1 for kw in pattern["keywords"] if kw in lowered)
        if match_count >= pattern["min_matches"]:
            detected_flags.append({
                "flag_id": pattern["id"],
                "reason": pattern["reason"],
                "matched_terms": [kw for kw in pattern["keywords"] if kw in lowered]
            })
            highest_priority = pattern["priority"]

    return highest_priority, detected_flags
