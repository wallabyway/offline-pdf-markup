const avemc = Autodesk.Viewing.Extensions.Markups.Core;
const avemcu = avemc.Utils;

/*
Example: https://icons.getbootstrap.com/icons/alarm/
`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-alarm" viewBox="0 0 16 16">
  <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z"/>
  <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 3.5c0 .753.333 1.429.86 1.887A8.035 8.035 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5zM13.5 1c-.753 0-1.429.333-1.887.86a8.035 8.035 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1z"/>
</svg>`
*/

class MarkupStamp extends avemc.Markup {
    constructor(id, editor, customSVG) {
        super(id, editor, ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity']);
        this.type = 'stamp';
        this.addMarkupMetadata = avemcu.addMarkupMetadata.bind(this);
        this.shape = avemcu.createSvgElement('g');

        this.group = avemcu.createSvgElement('g');


        let [width, height] = this.getDimensions(customSVG);
        this.group.innerHTML = customSVG.innerHTML;

        // Something like: <path id="hitarea" fill="none" d="M 0 0 l 16 0 l 0 16 l -16 0 z" />
        let path = `M 0 0 l ${width} 0 l 0 ${height} l ${-width} 0 z`;
        let hitarea = avemcu.createSvgElement('path');
        hitarea.setAttribute('id', "hitarea");
        hitarea.setAttribute('fill', "none");
        hitarea.setAttribute('d', path);
        this.group.appendChild(hitarea);
        // This is to standardize things:
        // width and height are 1 unit
        // position is in the centre
        // have to flip things because of y axis going upwards
        this.group.setAttribute('transform', `translate( -0.5 , 0.5 ) scale( ${1/width} , ${-1/height} )`)

        this.shape.appendChild(this.group);

        this.shape.hitarea = hitarea;
        this.shape.markup = hitarea;

        this.bindDomEvents();
    }

    getDimensions(customSVG) {
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
        // The value of the viewBox attribute is a list of four numbers: min-x, min-y, width and height.
        let vb = customSVG.getAttribute('viewBox');
        let strings = vb.split(' ')
        let width = parseInt(strings[2]);
        let height = parseInt(strings[3]);

        return [width, height];
    }

    // Get a new edit mode object for this markup type.
    getEditMode() {
        return new EditModeStamp(this.editor);
    }

    // Update the markup's transform properties.
    set(position, size) {
        this.setSize(position, size.x, size.y);
    }

    // Update the markup's SVG shape based on its style and transform properties.
    updateStyle() {
        const { style, shape, size } = this;

        const strokeWidth = style['stroke-width'];
        const strokeColor = this.highlighted ? this.highlightColor : avemcu.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        const fillColor = strokeColor;

        // This only provides translation and rotation, not scale
        const transform = this.getTransform() + ` scale( ${size.x} , ${size.y} )`;

        shape.setAttribute('stroke-width', strokeWidth);
        shape.setAttribute('stroke', strokeColor);
        shape.setAttribute('fill', fillColor);
        shape.setAttribute('transform', transform);
    }

    // Store the markup's type, transforms, and styles in its SVG shape.
    setMetadata() {
        const metadata = avemcu.cloneStyle(this.style);
        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(' ');
        metadata.size = [this.size.x, this.size.y].join(' ');
        metadata.rotation = String(this.rotation);
        return this.addMarkupMetadata(this.shape, metadata);
    }
}

class EditModeStamp extends avemc.EditMode {
    constructor(editor, customSVG) {
        super(editor, 'stamp', ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity']);
        this.customSVG = customSVG;
    }

    deleteMarkup(markup, cantUndo) {
        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            const action = new StampDeleteAction(this.editor, markup);
            action.addToHistory = !cantUndo;
            action.execute();
            return true;
        }
        return false;
    }

    onMouseMove(event) {
        super.onMouseMove(event);

        const { selectedMarkup, editor } = this;
        if (!selectedMarkup || !this.creating) {
            return;
        }

        let final = this.getFinalMouseDraggingPosition();
        final = editor.clientToMarkups(final.x, final.y);
        let position = {
            x: (this.firstPosition.x + final.x) * 0.5,
            y: (this.firstPosition.y + final.y) * 0.5
        };
        let size = this.size = {
            x: Math.abs(this.firstPosition.x - final.x),
            y: Math.abs(this.firstPosition.y - final.y)
        };
        const action = new StampUpdateAction(editor, selectedMarkup, position, size);
        action.execute();
    }

    onMouseDown() {
        super.onMouseDown();
        const { selectedMarkup, editor } = this;
        if (selectedMarkup) {
            return;
        }

        // Calculate center and size.
        let mousePosition = editor.getMousePosition();
        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;
        let position = this.firstPosition = editor.clientToMarkups(this.initialX, this.initialY);
        let size = this.size = editor.sizeFromClientToMarkups(1, 1);

        editor.beginActionGroup();
        const markupId = editor.getId();
        const action = new StampCreateAction(editor, markupId, position, size, 0, this.style, this.customSVG);
        action.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.creationBegin();
    }
}

class StampCreateAction extends avemc.EditAction {
    constructor(editor, id, position, size, rotation, style, customSVG) {
        super(editor, 'CREATE-STAMP', id);
        this.customSVG = customSVG;
        this.selectOnExecution = false;
        this.position = { x: position.x, y: position.y };
        this.size = { x: size.x, y: size.y };
        this.rotation = rotation;
        this.style = avemcu.cloneStyle(style);
    }

    redo() {
        const editor = this.editor;
        const stamp = new MarkupStamp(this.targetId, editor, this.customSVG);
        editor.addMarkup(stamp);
        stamp.setSize(this.position, this.size.x, this.size.y);
        stamp.setRotation(this.rotation);
        stamp.setStyle(this.style);
    }

    undo() {
        const markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    }
}

class StampUpdateAction extends avemc.EditAction {
    constructor(editor, stamp, position, size) {
        super(editor, 'UPDATE-STAMP', stamp.id);
        this.newPosition = { x: position.x, y: position.y };
        this.newSize = { x: size.x, y: size.y };
        this.oldPosition = { x: stamp.position.x, y: stamp.position.y };
        this.oldSize = { x: stamp.size.x, y: stamp.size.y };
    }

    redo() {
        this.applyState(this.targetId, this.newPosition, this.newSize);
    }

    undo() {
        this.applyState(this.targetId, this.oldPosition, this.oldSize);
    }

    merge(action) {
        if (this.targetId === action.targetId && this.type === action.type) {
            this.newPosition = action.newPosition;
            this.newSize = action.newSize;
            return true;
        }
        return false;
    }

    applyState(targetId, position, size) {
        const stamp = this.editor.getMarkup(targetId);
        if(!stamp) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        const epsilon = 0.0001;
        if (Math.abs(stamp.position.x - position.x) > epsilon || Math.abs(stamp.size.y - size.y) > epsilon ||
            Math.abs(stamp.position.y - position.y) > epsilon || Math.abs(stamp.size.y - size.y) > epsilon) {
            stamp.set(position, size);
        }
    }

    isIdentity() {
        return (
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newSize.x === this.oldSize.x &&
            this.newSize.y === this.oldSize.y
        );
    }
}

class StampDeleteAction extends avemc.EditAction {
    constructor(editor, stamp) {
        super(editor, 'DELETE-STAMP', stamp.id);
        this.createStamp = new StampCreateAction(
            editor,
            stamp.id,
            stamp.position,
            stamp.size,
            stamp.rotation,
            stamp.getStyle()
        );
    }

    redo() {
        this.createStamp.undo();
    }

    undo() {
        this.createStamp.redo();
    }
}