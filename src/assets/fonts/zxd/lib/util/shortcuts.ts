import { ZCommand } from '@zxd/consts/commands';
import { ZIcon } from '@zxd/consts/icon';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { Methods } from '@zxd/util/methods';

export class ZShortcuts {
  static cmd() {
    return Methods.isMacOS() ? '&#8984;' : 'Ctrl';
  }

  static ctrl() {
    return 'Ctrl';
  }

  static getShortcut(name: ZCommand | ZIcon | string, locale: string) {
    const labels = ZLocaleSettingsMethods.getLocalization(locale);
    switch (name as ZCommand | ZIcon) {
      case ZCommand.Add: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">I</div></div>`;
      case ZCommand.Copy: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">C</div></div>`;
      case ZCommand.Edit: return `<div class="z_shortcut"><div class="key">${ labels.key_enter }</div></div>`;
      case ZCommand.Escape: return `<div class="z_shortcut"><div class="key">${ labels.key_escape }</div></div>`;
      case ZCommand.Open: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">O</div></div>`;
      case ZCommand.Paste: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">V</div></div>`;
      case ZCommand.Remove: return `<div class="z_shortcut"><div class="key">${ labels.key_delete }</div></div>`;
      case ZCommand.ToggleSelection: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">A</div></div>`;

      case ZIcon.Bold: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">B</div></div>`;
      case ZIcon.Capitalize: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.ctrl() }</div> <div class="key">&#8679;</div> <div class="letter">C</div></div>`;
      case ZIcon.Link: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">K</div></div>`;
      case ZIcon.Mail: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">E</div></div>`;
      case ZIcon.Indent: return `<div class="z_shortcut"> <div class="key">TAB</div></div>`;
      case ZIcon.Attachment: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="key">&#8679;</div> <div class="letter">K</div></div>`;
      case ZIcon.Image: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="key">&#8679;</div> <div class="letter">L</div></div>`;
      case ZIcon.Italic: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">I</div></div>`;
      case ZIcon.Lowercase: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.ctrl() }</div> <div class="key">&#8679;</div> <div class="letter">L</div></div>`;
      case ZIcon.Outdent: return `<div class="z_shortcut"> <div class="key">&#8679;</div> <div class="key">TAB</div></div>`;
      case ZIcon.Subscript: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="key">&#8679;</div> <div class="letter">Z</div></div>`;
      case ZIcon.Superscript: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="key">&#8679;</div> <div class="letter">X</div></div>`;
      case ZIcon.Underline: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.cmd() }</div> <div class="letter">U</div></div>`;
      case ZIcon.Uppercase: return `<div class="z_shortcut"><div class="key">${ ZShortcuts.ctrl() }</div> <div class="key">&#8679;</div> <div class="letter">U</div></div>`;
      default:
        return '';
    }
  }
}
