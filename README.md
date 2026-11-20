# GSCS Bank - Customer Satisfaction (CSAT) Kiosk System
### Galapitiyagama SANASA Co-operative Society (ගලපිටියාගම සණස සමූපකාර සමිතිය)

කැෂියර් කවුන්ටරය (Cashier Counter) ඉදිරියේ තබන ටැබ් (Tablet) එකක් මඟින් පාරිභෝගික තෘප්තිමත් මට්ටම මැන බලා ක්ෂණිකව Google Sheet එකකට වාර්තා වන Kiosk Web Application පද්ධතිය.

---

## 🌟 ප්‍රධාන විශේෂාංග (Key Highlights)

1. **පිරිසිදු පාරිභෝගික අතුරුමුහුණත (Clean & Distraction-Free UI)**:
   - පාරිභෝගිකයාට අනවශ්‍ය තාක්ෂණික බොත්තම්, Screen Wake indicators හෝ Sync alerts කිසිවක් තිරයේ නොපෙනේ.
   - බැංකුවේ නිල ලාංඡනය හා තෘප්තිමත් මට්ටම දැක්වෙන Emoji 5 පමණක් ප්‍රධාන වශයෙන් දිස්වේ.
2. **Screen Always ON (තිරය Off නොවී තබා ගැනීම)**:
   - **Screen Wake Lock API** මඟින් තිරය sleep/lock නොවී පසුබිමෙන් (background) නිරන්තරයෙන් ක්‍රියා කරයි.
3. **ස්වයංක්‍රීයව Reset වීම**:
   - පාරිභෝගිකයෙකු Emoji එකක් එබූ සැනින් "ස්තූතියි! (Thank You!)" තිරය පෙන්වා තත්පර 2.6කින් ඊළඟ පාරිභෝගිකයා වෙනුවෙන් නැවත මුල් තිරයට පත්වේ.
4. **Google Sheets ස්වයංක්‍රීය වාර්තාකරණය**:
   - සෑම ප්‍රතිචාරයක්ම දිනය, වේලාව, කවුන්ටර අංකය, ශාඛාව, තරු ගණන සහ Emoji එක සහිතව Google Sheet එකේ පේළියක් ලෙස සටහන් වේ.
5. **Offline Queue (අන්තර්ජාලය විසන්ධි වුවද ක්‍රියා කරයි)**:
   - Wi-Fi විසන්ධි වුවද ratings නොනැසී ටැබ් එකේ ගබඩා වී, නැවත Wi-Fi සම්බන්ධ වූ විට Google Sheet එකට පසුබිමෙන්ම auto-sync වේ.

---

## 🔒 රහස්‍ය Settings (සැකසුම්) විවෘත කරන ආකාරය

පාරිභෝගිකයන්ට සැකසුම් වෙනස් කළ නොහැකි වන පරිදි Settings බොත්තම තිරයෙන් සඟවා ඇත. කැෂියර් මහතාට/මියට හෝ Administrator හට පහත ආකාරයට Settings විවෘත කළ හැක:

1. තිරයේ වම්පස ඇති **GSCS බැංකු Logo එක මත 3 වතාවක් (Triple-Click / Tap)** ඉක්මනින් ඔබන්න. (හෝ තිරයේ ඉහළ දකුණු කෙළවර 3 වතාවක් ඔබන්න / Keyboard එකේ `S` අකුර ඔබන්න).
2. රහස් අංකය (Default PIN: **`1234`**) ඇතුළත් කරන්න.
3. Settings විවෘත වන අතර, එහිදී Google Sheet URL එක, කවුන්ටරයේ නම ඇතුළත් කිරීමට හා Fullscreen කිරීමට හැකිය.

---

## 🚀 Google Sheet එක සකස් කරගන්නා ආකාරය

1. [Google Sheets](https://sheets.google.com) වෙත ගොස් නව Sheet එකක් සාදන්න.
2. ඉහළ මෙනුවේ **Extensions** &gt; **Apps Script** ක්ලික් කරන්න.
3. එහි ඇති පරණ කේත මකා, අපගේ ප්‍රොජෙක්ට් ෆෝල්ඩරයේ ඇති **`google-apps-script.js`** ගොනුවේ කේතය සම්පූර්ණයෙන්ම paste කර **Save (💾)** කරන්න.
4. ඉහළ දකුණු කෙළවරේ ඇති **Deploy** &gt; **New deployment** ඔබන්න.
5. Type එක ලෙස **Web app** තෝරා:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
6. **Deploy** කර ලැබෙන **Web app URL** එක Copy කරගන්න.
7. Kiosk ඇප් එකේ Logo එක 3 වරක් ඔබා, PIN `1234` ගසා එම URL එක Paste කර **Save** කරන්න.
