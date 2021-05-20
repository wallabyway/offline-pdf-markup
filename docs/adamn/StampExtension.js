class StampExtension extends Autodesk.Viewing.Extension {
  async load() {
      await this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore');
      await this.loadScript('/stamp-markup.js');
      return true;
  }

  unload() {
      return true;
  }

  loadScript(url) {
      return new Promise(function (resolve, reject) {
          const script = document.createElement('script');
          script.setAttribute('src', url);
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
      });
  }

  startDrawing(customSVG) {
      const markupExt = this.viewer.getExtension('Autodesk.Viewing.MarkupsCore');
      markupExt.show();
      markupExt.enterEditMode();
      markupExt.changeEditMode(new EditModeStamp(markupExt, customSVG));
  }

  stopDrawing() {
      const markupExt = this.viewer.getExtension('Autodesk.Viewing.MarkupsCore');
      markupExt.leaveEditMode();
      markupExt.hide();
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('StampExtension', StampExtension);