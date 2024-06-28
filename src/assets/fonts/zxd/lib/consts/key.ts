/**
 * Keyboard key codes
 */
export enum ZKey {
  // alpha keys
  KeyA = 'a',
  KeyB = 'b',
  KeyC = 'c',
  KeyD = 'd',
  KeyE = 'e',
  KeyF = 'f',
  KeyG = 'g',
  KeyH = 'h',
  KeyI = 'i',
  KeyJ = 'j',
  KeyK = 'k',
  KeyL = 'l',
  KeyM = 'm',
  KeyN = 'n',
  KeyO = 'o',
  KeyP = 'p',
  KeyQ = 'q',
  KeyR = 'r',
  KeyS = 's',
  KeyT = 't',
  KeyU = 'u',
  KeyV = 'v',
  KeyW = 'w',
  KeyX = 'x',
  KeyY = 'y',
  KeyZ = 'z',
  KeyUpperA = 'A',
  KeyUpperB = 'B',
  KeyUpperC = 'C',
  KeyUpperD = 'D',
  KeyUpperE = 'E',
  KeyUpperF = 'F',
  KeyUpperG = 'G',
  KeyUpperH = 'H',
  KeyUpperI = 'I',
  KeyUpperJ = 'J',
  KeyUpperK = 'K',
  KeyUpperL = 'L',
  KeyUpperM = 'M',
  KeyUpperN = 'N',
  KeyUpperO = 'O',
  KeyUpperP = 'P',
  KeyUpperQ = 'Q',
  KeyUpperR = 'R',
  KeyUpperS = 'S',
  KeyUpperT = 'T',
  KeyUpperU = 'U',
  KeyUpperV = 'V',
  KeyUpperW = 'W',
  KeyUpperX = 'X',
  KeyUpperY = 'Y',
  KeyUpperZ = 'Z',

  // Modifier keys
  Alt = 'Alt',
  AltGraph = 'AltGraph',
  CapsLock = 'CapsLock',
  Control = 'Control',
  Fn = 'Fn',
  FnLock = 'FnLock',
  Hyper = 'Hyper',
  Meta = 'Meta',
  NumLock = 'NumLock',
  ScrollLock = 'ScrollLock',
  Shift = 'Shift',
  Super = 'Super',
  Symbol = 'Symbol',
  SymbolLock = 'SymbolLock',

  // Whitespace keys
  Enter = 'Enter',
  Tab = 'Tab',
  Space = ' ',

  // Navigation keys
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowUp = 'ArrowUp',
  End = 'End',
  Home = 'Home',
  PageDown = 'PageDown',
  PageUp = 'PageUp',

  // Editing keys
  Backspace = 'Backspace',
  Clear = 'Clear',
  Copy = 'Copy',
  CrSel = 'CrSel',
  Cut = 'Cut',
  Delete = 'Delete',
  EraseEof = 'EraseEof',
  ExSel = 'ExSel',
  Insert = 'Insert',
  Paste = 'Paste',
  Redo = 'Redo',
  Undo = 'Undo',

  // UI keys
  Accept = 'Accept',
  Again = 'Again',
  Attn = 'Attn',
  Cancel = 'Cancel',
  ContextMenu = 'ContextMenu',
  Escape = 'Escape',
  Execute = 'Execute',
  Find = 'Find',
  Finish = 'Finish',
  Help = 'Help',
  Pause = 'Pause',
  Play = 'Play',
  Props = 'Props',
  Select = 'Select',
  ZoomIn = 'ZoomIn',
  ZoomOut = 'ZoomOut',

  // Device keys
  BrightnessDown = 'BrightnessDown',
  BrightnessUp = 'BrightnessUp',
  Eject = 'Eject',
  LogOff = 'LogOff',
  Power = 'Power',
  PowerOff = 'PowerOff',
  PrintScreen = 'PrintScreen',
  Hibernate = 'Hibernate',
  Standby = 'Standby',
  WakeUp = 'WakeUp',

  // Function keys
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  F13 = 'F13',
  F14 = 'F14',
  F15 = 'F15',
  F16 = 'F16',
  F17 = 'F17',
  F18 = 'F18',
  F19 = 'F19',
  F20 = 'F20',
  Soft1 = 'Soft1',
  Soft2 = 'Soft2',
  Soft3 = 'Soft3',
  Soft4 = 'Soft4',

  // Phone keys
  AppSwitch = 'AppSwitch',
  Call = 'Call',
  Camera = 'Camera',
  CameraFocus = 'CameraFocus',
  EndCall = 'EndCall',
  GoBack = 'GoBack',
  GoHome = 'GoHome',
  HeadsetHook = 'HeadsetHook',
  LastNumberRedial = 'LastNumberRedial',
  Notification = 'Notification',
  MannerMode = 'MannerMode',
  VoiceDial = 'VoiceDial',

  // Multimedia keys
  ChannelDown = 'ChannelDown',
  ChannelUp = 'ChannelUp',
  MediaFastForward = 'MediaFastForward',
  MediaPause = 'MediaPause',
  MediaPlay = 'MediaPlay',
  MediaPlayPause = 'MediaPlayPause',
  MediaRecord = 'MediaRecord',
  MediaRewind = 'MediaRewind',
  MediaStop = 'MediaStop',
  MediaTrackNext = 'MediaTrackNext',
  MediaTrackPrevious = 'MediaTrackPrevious',

  // Audio control keys
  AudioBalanceLeft = 'AudioBalanceLeft',
  AudioBalanceRight = 'AudioBalanceRight',
  AudioBassDown = 'AudioBassDown',
  AudioBassBoostDown = 'AudioBassBoostDown',
  AudioBassBoostToggle = 'AudioBassBoostToggle',
  AudioBassBoostUp = 'AudioBassBoostUp',
  AudioBassUp = 'AudioBassUp',
  AudioFaderFront = 'AudioFaderFront',
  AudioFaderRear = 'AudioFaderRear',
  AudioSurroundModeNext = 'AudioSurroundModeNext',
  AudioTrebleDown = 'AudioTrebleDown',
  AudioTrebleUp = 'AudioTrebleUp',
  AudioVolumeDown = 'AudioVolumeDown',
  AudioVolumeMute = 'AudioVolumeMute',
  AudioVolumeUp = 'AudioVolumeUp',
  MicrophoneToggle = 'MicrophoneToggle',
  MicrophoneVolumeDown = 'MicrophoneVolumeDown',
  MicrophoneVolumeMute = 'MicrophoneVolumeMute',
  MicrophoneVolumeUp = 'MicrophoneVolumeUp',

  // TV control keys
  TV = 'TV',
  TV3DMode = 'TV3DMode',
  TVAntennaCable = 'TVAntennaCable',
  TVAudioDescription = 'TVAudioDescription',
  TVAudioDescriptionMixDown = 'TVAudioDescriptionMixDown',
  TVAudioDescriptionMixUp = 'TVAudioDescriptionMixUp',
  TVContentsMenu = 'TVContentsMenu',
  TVDataService = 'TVDataService',
  TVInput = 'TVInput',
  TVInputComponent1 = 'TVInputComponent1',
  TVInputComponent2 = 'TVInputComponent2',
  TVInputComposite1 = 'TVInputComposite1',
  TVInputComposite2 = 'TVInputComposite2',
  TVInputHDMI1 = 'TVInputHDMI1',
  TVInputHDMI2 = 'TVInputHDMI2',
  TVInputHDMI3 = 'TVInputHDMI3',
  TVInputHDMI4 = 'TVInputHDMI4',
  TVInputVGA1 = 'TVInputVGA1',
  TVMediaContext = 'TVMediaContext',
  TVNetwork = 'TVNetwork',
  TVNumberEntry = 'TVNumberEntry',
  TVPower = 'TVPower',
  TVRadioService = 'TVRadioService',
  TVSatellite = 'TVSatellite',
  TVSatelliteBS = 'TVSatelliteBS',
  TVSatelliteCS = 'TVSatelliteCS',
  TVSatelliteToggle = 'TVSatelliteToggle',
  TVTerrestrialAnalog = 'TVTerrestrialAnalog',
  TVTerrestrialDigital = 'TVTerrestrialDigital',
  TVTimer = 'TVTimer',

  // Media controller keys
  AVRInput = 'AVRInput',
  AVRPower = 'AVRPower',
  ColorF0Red = 'ColorF0Red',
  ColorF1Green = 'ColorF1Green',
  ColorF2Yellow = 'ColorF2Yellow',
  ColorF3Blue = 'ColorF3Blue',
  ColorF4Grey = 'ColorF4Grey',
  ColorF5Brown = 'ColorF5Brown',
  ClosedCaptionToggle = 'ClosedCaptionToggle',
  Dimmer = 'Dimmer',
  DisplaySwap = 'DisplaySwap',
  DVR = 'DVR',
  Exit = 'Exit',
  FavoriteClear0 = 'FavoriteClear0',
  FavoriteClear1 = 'FavoriteClear1',
  FavoriteClear2 = 'FavoriteClear2',
  FavoriteClear3 = 'FavoriteClear3',
  FavoriteRecall0 = 'FavoriteRecall0',
  FavoriteRecall1 = 'FavoriteRecall1',
  FavoriteRecall2 = 'FavoriteRecall2',
  FavoriteRecall3 = 'FavoriteRecall3',
  FavoriteStore0 = 'FavoriteStore0',
  FavoriteStore1 = 'FavoriteStore1',
  FavoriteStore2 = 'FavoriteStore2',
  FavoriteStore3 = 'FavoriteStore3',
  Guide = 'Guide',
  GuideNextDay = 'GuideNextDay',
  GuidePreviousDay = 'GuidePreviousDay',
  Info = 'Info',
  InstantReplay = 'InstantReplay',
  Link = 'Link',
  ListProgram = 'ListProgram',
  LiveContent = 'LiveContent',
  Lock = 'Lock',
  MediaApps = 'MediaApps',
  MediaAudioTrack = 'MediaAudioTrack',
  MediaLast = 'MediaLast',
  MediaSkipBackward = 'MediaSkipBackward',
  MediaSkipForward = 'MediaSkipForward',
  MediaStepBackward = 'MediaStepBackward',
  MediaStepForward = 'MediaStepForward',
  MediaTopMenu = 'MediaTopMenu',
  NavigateIn = 'NavigateIn',
  NavigateNext = 'NavigateNext',
  NavigateOut = 'NavigateOut',
  NavigatePrevious = 'NavigatePrevious',
  NextFavoriteChannel = 'NextFavoriteChannel',
  NextUserProfile = 'NextUserProfile',
  OnDemand = 'OnDemand',
  Pairing = 'Pairing',
  PinPDown = 'PinPDown',
  PinPMove = 'PinPMove',
  PinPToggle = 'PinPToggle',
  PinPUp = 'PinPUp',
  PlaySpeedDown = 'PlaySpeedDown',
  PlaySpeedReset = 'PlaySpeedReset',
  PlaySpeedUp = 'PlaySpeedUp',
  RandomToggle = 'RandomToggle',
  RcLowBattery = 'RcLowBattery',
  RecordSpeedNext = 'RecordSpeedNext',
  RfBypass = 'RfBypass',
  ScanChannelsToggle = 'ScanChannelsToggle',
  ScreenModeNext = 'ScreenModeNext',
  Settings = 'Settings',
  SplitScreenToggle = 'SplitScreenToggle',
  STBInput = 'STBInput',
  STBPower = 'STBPower',
  Subtitle = 'Subtitle',
  Teletext = 'Teletext',
  VideoModeNext = 'VideoModeNext',
  Wink = 'Wink',
  ZoomToggle = 'ZoomToggle',

  // Speech recognition keys
  SpeechCorrectionList = 'SpeechCorrectionList',
  SpeechInputToggle = 'SpeechInputToggle',

  // Document keys
  Close = 'Close',
  New = 'New',
  Open = 'Open',
  Print = 'Print',
  Save = 'Save',
  SpellCheck = 'SpellCheck',
  MailForward = 'MailForward',
  MailReply = 'MailReply',
  MailSend = 'MailSend',

  // Application selector keys
  LaunchCalculator = 'LaunchCalculator',
  LaunchCalendar = 'LaunchCalendar',
  LaunchContacts = 'LaunchContacts',
  LaunchMail = 'LaunchMail',
  LaunchMediaPlayer = 'LaunchMediaPlayer',
  LaunchMusicPlayer = 'LaunchMusicPlayer',
  LaunchMyComputer = 'LaunchMyComputer',
  LaunchPhone = 'LaunchPhone',
  LaunchScreenSaver = 'LaunchScreenSaver',
  LaunchSpreadsheet = 'LaunchSpreadsheet',
  LaunchWebBrowser = 'LaunchWebBrowser',
  LaunchWebCam = 'LaunchWebCam',
  LaunchWordProcessor = 'LaunchWordProcessor',
  LaunchApplication1 = 'LaunchApplication1',
  LaunchApplication2 = 'LaunchApplication2',
  LaunchApplication3 = 'LaunchApplication3',
  LaunchApplication4 = 'LaunchApplication4',
  LaunchApplication5 = 'LaunchApplication5',
  LaunchApplication6 = 'LaunchApplication6',
  LaunchApplication7 = 'LaunchApplication7',
  LaunchApplication8 = 'LaunchApplication8',
  LaunchApplication9 = 'LaunchApplication9',
  LaunchApplication10 = 'LaunchApplication10',
  LaunchApplication11 = 'LaunchApplication11',
  LaunchApplication12 = 'LaunchApplication12',
  LaunchApplication13 = 'LaunchApplication13',
  LaunchApplication14 = 'LaunchApplication14',
  LaunchApplication15 = 'LaunchApplication15',
  LaunchApplication16 = 'LaunchApplication16',

  // Browser control keys
  BrowserBack = 'BrowserBack',
  BrowserFavorites = 'BrowserFavorites',
  BrowserForward = 'BrowserForward',
  BrowserHome = 'BrowserHome',
  BrowserRefresh = 'BrowserRefresh',
  BrowserSearch = 'BrowserSearch',
  BrowserStop = 'BrowserStop',

  // Numeric keypad keys
  Decimal = 'Decimal',
  Key11 = 'Key11',
  Key12 = 'Key12',
  Multiply = 'Multiply',
  Add = 'Add',
  Divide = 'Divide',
  Subtract = 'Subtract',
  Separator = 'Separator',
  NumPad_0 = '0',
  NumPad_1 = '1',
  NumPad_2 = '2',
  NumPad_3 = '3',
  NumPad_4 = '4',
  NumPad_5 = '5',
  NumPad_6 = '6',
  NumPad_7 = '7',
  NumPad_8 = '8',
  NumPad_9 = '9',
}

