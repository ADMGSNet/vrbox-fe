import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ZButtonType } from '@zxd/consts/button';
import { ZEditorButtonIcon } from '@zxd/consts/editor-button-icon';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { ZShortcuts } from '@zxd/util/shortcuts';

import { ZButtonComponent } from '../z-button/z-button.component';

@Component({
  selector: 'z-editor-button',
  templateUrl: './../z-button/z-button.component.html',
  styleUrls: ['./../z-button/z-button.component.scss', './z-editor-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZEditorButtonComponent extends ZButtonComponent implements AfterViewInit {
  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Icon
   */
  get icon() {
    return this._icon;
  }
  @Input() set icon(value: ZEditorButtonIcon) {
    let label = '';
    const localeSettings = ZLocaleSettingsMethods.getLocalization(this.locale);

    switch (value) {
      case ZEditorButtonIcon.AlignBottom:
        label = localeSettings.alignBottom;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.AlignMiddle:
        label = localeSettings.alignMiddle;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.AlignTop:
        label = localeSettings.alignTop;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.Bold:
        label = localeSettings.bold;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.Italic:
        label = localeSettings.italic;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.JustifyCenter:
        label = localeSettings.alignCenter;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.JustifyFull:
        label = localeSettings.justifyFull;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.JustifyLeft:
        label = localeSettings.alignLeft;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.JustifyRight:
        label = localeSettings.alignRight;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.Strikethrough:
        label = localeSettings.strikethrough;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.Subscript:
        label = localeSettings.subscript;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.Superscript:
        label = localeSettings.superscript;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.Underline:
        label = localeSettings.underline;
        this.type = ZButtonType.Toggle;
        break;
      case ZEditorButtonIcon.Capitalize:
        label = localeSettings.capitalize;
        break;
      case ZEditorButtonIcon.CreateAnchor:
        label = localeSettings.createAnchor;
        break;
      case ZEditorButtonIcon.CreateEmailLink:
        label = localeSettings.createEmailLink;
        break;
      case ZEditorButtonIcon.CreateLink:
        label = localeSettings.createLink;
        break;
      case ZEditorButtonIcon.Indent:
        label = localeSettings.indent;
        break;
      case ZEditorButtonIcon.InsertAttachment:
        label = localeSettings.insertAttachment;
        break;
      case ZEditorButtonIcon.InsertImage:
        label = localeSettings.insertImage;
        break;
      case ZEditorButtonIcon.InsertOrderedList:
        label = localeSettings.orderedList;
        break;
      case ZEditorButtonIcon.InsertUnorderedList:
        label = localeSettings.unorderedList;
        break;
      case ZEditorButtonIcon.Lowercase:
        label = localeSettings.lowercase;
        break;
      case ZEditorButtonIcon.Outdent:
        label = localeSettings.outdent;
        break;
      case ZEditorButtonIcon.Uppercase:
        label = localeSettings.uppercase;
        break;
    }
    // set type
    this._icon = value;

    this.tooltip = label + ZShortcuts.getShortcut(label, this._locale);

    const element = this.elementRef.nativeElement as HTMLElement;
    const content = element.querySelector('.z_button_content');
    if (content) {
      content.innerHTML = `<div class="zixfont-${ value }"></div>`;
    }
  }
  private _icon = ZEditorButtonIcon.None;

}
