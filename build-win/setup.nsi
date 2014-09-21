; makensis /DVersion="VERSION_HERE" setup.nsi
!ifndef Version
  StrCpy $Version "0.0.1"
!endif

; === Global defines ===
!define PRODUCT_NAME "Twister"
!define PRODUCT_VERSION "${Version}"
!define PRODUCT_MAINEXE "twister.exe"
!define PRODUCT_ICON "twister.ico"
!define PRODUCT_WEB_SITE "https://github.com/iShift/twister-webkit"

!define PRODUCT_DIR_ROOT_KEY "HKCU"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\${PRODUCT_MAINEXE}"
!define PRODUCT_UNINST_ROOT_KEY "HKCU"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_STARTMENU_REGVAL "NSIS:StartMenuDir"



; The best compression
SetCompressor /SOLID lzma
CRCCheck on
RequestExecutionLevel user

; MUI 2 ------
!include "MUI2.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\orange-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\orange-uninstall.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange-uninstall.bmp"

; Language Selection Dialog Settings
!define MUI_LANGDLL_REGISTRY_ROOT "${PRODUCT_UNINST_ROOT_KEY}"
!define MUI_LANGDLL_REGISTRY_KEY "${PRODUCT_UNINST_KEY}"
!define MUI_LANGDLL_REGISTRY_VALUENAME "NSIS:Language"
!define MUI_LANGDLL_ALLLANGUAGES

; Remove branding text
BrandingText " "



; Welcome page
!insertmacro MUI_PAGE_WELCOME
; Components page
!define MUI_COMPONENTSPAGE_NODESC
!insertmacro MUI_PAGE_COMPONENTS
; Directory page
!insertmacro MUI_PAGE_DIRECTORY
; Start menu page
var ICONS_GROUP
!define MUI_STARTMENUPAGE_NODISABLE
!define MUI_STARTMENUPAGE_DEFAULTFOLDER "${PRODUCT_NAME}"
!define MUI_STARTMENUPAGE_REGISTRY_ROOT "${PRODUCT_UNINST_ROOT_KEY}"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "${PRODUCT_UNINST_KEY}"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "${PRODUCT_STARTMENU_REGVAL}"
!insertmacro MUI_PAGE_STARTMENU Application $ICONS_GROUP
; Inst files page
!insertmacro MUI_PAGE_INSTFILES
; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\${PRODUCT_MAINEXE}"
!insertmacro MUI_PAGE_FINISH



; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH



; Language files
!insertmacro MUI_LANGUAGE "English" ;first language is the default language
!insertmacro MUI_LANGUAGE "Afrikaans"
!insertmacro MUI_LANGUAGE "Albanian"
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "Basque"
!insertmacro MUI_LANGUAGE "Belarusian"
!insertmacro MUI_LANGUAGE "Bosnian"
!insertmacro MUI_LANGUAGE "Breton"
!insertmacro MUI_LANGUAGE "Bulgarian"
!insertmacro MUI_LANGUAGE "Catalan"
!insertmacro MUI_LANGUAGE "Croatian"
!insertmacro MUI_LANGUAGE "Czech"
!insertmacro MUI_LANGUAGE "Danish"
!insertmacro MUI_LANGUAGE "Dutch"
!insertmacro MUI_LANGUAGE "Esperanto"
!insertmacro MUI_LANGUAGE "Estonian"
!insertmacro MUI_LANGUAGE "Farsi"
!insertmacro MUI_LANGUAGE "Finnish"
!insertmacro MUI_LANGUAGE "French"
!insertmacro MUI_LANGUAGE "Galician"
!insertmacro MUI_LANGUAGE "German"
!insertmacro MUI_LANGUAGE "Greek"
!insertmacro MUI_LANGUAGE "Hebrew"
!insertmacro MUI_LANGUAGE "Hungarian"
!insertmacro MUI_LANGUAGE "Icelandic"
!insertmacro MUI_LANGUAGE "Indonesian"
!insertmacro MUI_LANGUAGE "Irish"
!insertmacro MUI_LANGUAGE "Italian"
!insertmacro MUI_LANGUAGE "Japanese"
!insertmacro MUI_LANGUAGE "Korean"
!insertmacro MUI_LANGUAGE "Kurdish"
!insertmacro MUI_LANGUAGE "Latvian"
!insertmacro MUI_LANGUAGE "Lithuanian"
!insertmacro MUI_LANGUAGE "Luxembourgish"
!insertmacro MUI_LANGUAGE "Macedonian"
!insertmacro MUI_LANGUAGE "Malay"
!insertmacro MUI_LANGUAGE "Mongolian"
!insertmacro MUI_LANGUAGE "Norwegian"
!insertmacro MUI_LANGUAGE "NorwegianNynorsk"
!insertmacro MUI_LANGUAGE "Polish"
!insertmacro MUI_LANGUAGE "Portuguese"
!insertmacro MUI_LANGUAGE "PortugueseBR"
!insertmacro MUI_LANGUAGE "Romanian"
!insertmacro MUI_LANGUAGE "Russian"
!insertmacro MUI_LANGUAGE "Serbian"
!insertmacro MUI_LANGUAGE "SerbianLatin"
!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "Slovak"
!insertmacro MUI_LANGUAGE "Slovenian"
!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "SpanishInternational"
!insertmacro MUI_LANGUAGE "Swedish"
!insertmacro MUI_LANGUAGE "Thai"
!insertmacro MUI_LANGUAGE "TradChinese"
!insertmacro MUI_LANGUAGE "Turkish"
!insertmacro MUI_LANGUAGE "Ukrainian"
!insertmacro MUI_LANGUAGE "Uzbek"
!insertmacro MUI_LANGUAGE "Welsh"

; Reserve language files in solid compression method
!insertmacro MUI_RESERVEFILE_LANGDLL

; MUI end ------



Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${PRODUCT_NAME}-${PRODUCT_VERSION}.exe"
InstallDir "$APPDATA\${PRODUCT_NAME}"
InstallDirRegKey ${PRODUCT_DIR_ROOT_KEY} "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

; Request application privileges
RequestExecutionLevel user

VIProductVersion ${PRODUCT_VERSION}
VIAddVersionKey /LANG=${LANG_ENGLISH} ProductName "${PRODUCT_NAME} ${PRODUCT_VERSION}"
VIAddVersionKey /LANG=${LANG_ENGLISH} FileVersion ${PRODUCT_VERSION}
VIAddVersionKey /LANG=${LANG_ENGLISH} ProductVersion ${PRODUCT_VERSION}
VIAddVersionKey /LANG=${LANG_ENGLISH} OriginalFilename "${PRODUCT_NAME}-${PRODUCT_VERSION}.exe"
VIAddVersionKey /LANG=${LANG_ENGLISH} FileDescription "${PRODUCT_NAME} ${PRODUCT_VERSION} Setup"
VIAddVersionKey /LANG=${LANG_ENGLISH} LegalCopyright ""



Function .onInit
  !insertmacro MUI_LANGDLL_DISPLAY
FunctionEnd



Section "Core Files" SEC01
  SectionIn RO
  SetOutPath "$INSTDIR"

; === Add Files ===
  File "${PRODUCT_ICON}"
  ; Add node-webkit files
  File "source\${PRODUCT_MAINEXE}"
  File "source\nw.pak"
  File "source\icudtl.dat"
  File "source\*.dll"
  File /r "source\locales"
  ; Add twister-core
  File /r "source\bin"

; === Shortcuts ===
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
  CreateDirectory "$SMPROGRAMS\$ICONS_GROUP"
  CreateShortCut "$SMPROGRAMS\$ICONS_GROUP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_MAINEXE}" "" "$INSTDIR\${PRODUCT_ICON}"
  !insertmacro MUI_STARTMENU_WRITE_END
SectionEnd

SectionGroup /e "Themes" SEC03

  Section "Default" SEC04
    SectionIn RO
    SetOutPath "$INSTDIR\html"
    File /r "source\html\default"
    File "source\html\empty.html"
  SectionEnd

  Section "Calm" SEC05
    SetOutPath "$INSTDIR\html"
    File /r "source\html\calm"
  SectionEnd

  Section "Nin" SEC06
    SetOutPath "$INSTDIR\html"
    File /r "source\html\nin"
  SectionEnd

SectionGroupEnd

Section "Blockchain dump" SEC02
  SetOutPath "$PROFILE\.twister"
  File /r "source\bootstrap\*.*"
SectionEnd

Section "Add Shortcut to Desktop" SEC07
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_MAINEXE}" "" "$INSTDIR\${PRODUCT_ICON}"
SectionEnd

Section "Add Shortcut to Startup" SEC08
  CreateShortCut "$SMSTARTUP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_MAINEXE}" "" "$INSTDIR\${PRODUCT_ICON}" 0 SW_SHOWMINIMIZED
SectionEnd


Section -AdditionalIcons
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
  CreateShortCut "$SMPROGRAMS\$ICONS_GROUP\Uninstall ${PRODUCT_NAME}.lnk" "$INSTDIR\uninst.exe"
  !insertmacro MUI_STARTMENU_WRITE_END
SectionEnd

Section -Post
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_DIR_ROOT_KEY} "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\${PRODUCT_MAINEXE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\${PRODUCT_ICON}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
SectionEnd



Section Uninstall
  !insertmacro MUI_STARTMENU_GETFOLDER "Application" $ICONS_GROUP

; === Delete files and directories ===
  Delete "$INSTDIR\uninst.exe"
  Delete "$INSTDIR\${PRODUCT_ICON}"
  Delete "$INSTDIR\${PRODUCT_MAINEXE}"
  Delete "$INSTDIR\nw.pak"
  Delete "$INSTDIR\icudtl.dat"
  Delete "$INSTDIR\*.dll"
  RMDir /r "$INSTDIR\bin"
  RMDir /r "$INSTDIR\html"
  RMDir /r "$INSTDIR\bootstrap"

; === Delete shortcuts ===
  Delete "$SMPROGRAMS\$ICONS_GROUP\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\$ICONS_GROUP\Uninstall ${PRODUCT_NAME}.lnk"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "$SMSTARTUP\${PRODUCT_NAME}.lnk"

  RMDir "$SMPROGRAMS\$ICONS_GROUP"
  RMDir "$INSTDIR"

  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey ${PRODUCT_DIR_ROOT_KEY} "${PRODUCT_DIR_REGKEY}"
  SetAutoClose true
SectionEnd
