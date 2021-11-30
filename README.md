# Pass Web Client (Reactjs)

## App Architecture

- Data

  - Language {current language, switch}
  - Terminal {terminal data, set terminal}
  - Theme {material-ui theme provider}
  - User Data <!-- not save to state now, only session -->
  - Crossing

- Routes
  - Auth routes (login | reset password)
  - Home (only authenticated user can access)

## Database Tables

- SC203 Terminal Locations
- SC013 Terminal IPs
- IB001 Expected Movement (Flights)
- IFR700 Person Info
- PSR001 Saudi Passport
- PSR018 Military Permits
- PSR015 Travel Permit (Ctzn)
- IFR711 Person Extension
- BCR021 Citizin Crossing
- BCR019 Resident Crossing
- BCR280 Policy Conditions
- BC018 Mofa Visitors
- BCR032 Exchanged Visitors
- BCR024, BCR025, IFR700, IFR703 Visitor Records

## Visitors Documents:

- LK١٠٠١١٢٢٢ - 102 - 1
- ١٢٣٤٥٦٧٨٩٠١٢ - 805 - 1

## Pilgrim Documents
- Non GCC with Passport
    - Passport: QWD3236
    - Nationality: 102 Jordan

## Operator Entry - PILGRIM

- new_arabic_first_name
- new_arabic_father_name
- new_arabic_grandfather_name
- new_arabic_family_name
- new_english_first_name
- new_english_father_name
- new_english_grandfather_name
- new_english_family_name
- new_nationality_code
- new_birth_date
- new_gender
- new_document_number
- new_passport_type_code
- new_document_issue_location
- new_group_membership_type_code => lookup (default to 1)
- new_sponsor_number => string of digits
- new_visa_number
- new_visa_issuance_place_code => lookup
- new_gcc_id => only for gcc
- new_permit_number
