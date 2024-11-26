import _ from 'lodash'

/**
    For drop zone need add ref
    ```html
        <drop-zone-container
            ref="myFirstDropZone"
            ...
        />
    ```

    For drag item need to add events
    ```html
        <drag-item
            draggable
            dragstart="(event) => dragStartHandler(event, item)"
            dragend="(event) => dragEndHandler(event, item)"
            ...
        />
    ```

    Set up drop zones
    after that in `mounted` function need add drop zone ref and data variable
    ```javascript
        this.addDropZone(this.$refs.myFirstDropZone, this.dropZoneList_1)
        this.addDropZone(this.$refs.mySecondDropZone, this.dropZoneList_2)
    ```

    Set up callback functions
    ```javascript
        this.setSuccessFn(this.dragSuccess)
        this.setFailedFn(this.dragFailed)
        this.setEnterFn(this.dropEnter)
        this.setLeaveFn(this.dropLeave)
    ```

    Init drag&drop
    ```javascript
        this.dragAndDropStart()
    ```
*/
export default {
    data() {
        return {
            dropZone: [],
            dragItems: [],
            _aboveActiveElement: true,
            _activeItem: null,
            _isOnDropZone: false,
            _dropEnterFn: null,
            _dropLeaveFn: null,
            _startFn: null,
            _successFn: null,
            _failedFn: null,
            _item: null,
            _from: null,
            _to: null,
        }
    },
    methods: {        
        dragAndDropStart() {
            console.log(this.dropZone)
            this.dropZone.map(({ref}) => {
                ref.addEventListener('dragover', (event) => event.preventDefault())
                ref.addEventListener('dragenter', this.dragEnterHandler)
                ref.addEventListener('dragleave', this.dragLeaveHandler)
                ref.addEventListener('drop', this.dropHandler)
            })
        },
        dropHandler(event) {
            event.preventDefault()
        },
        dragEnterHandler(event) {
            event.preventDefault()
            if (!_.isEqual(this._from, this.activeDropZone(event.target))) {
                if (!this._isOnDropZone) {
                    this._isOnDropZone = true
                    this._dropEnterFn && (this._dropEnterFn({
                        ref: this._to.ref,
                        data: this._to.data
                    }))
                }
            }
        },
        dragLeaveHandler(event) {
            event.preventDefault()
            if (this._isOnDropZone && event.relatedTarget.contains(this._to.ref)) {
                this._isOnDropZone = false
                this._dropLeaveFn && (this._dropLeaveFn({
                    ref: this._to.ref,
                    data: this._to.data
                }))
            }
        },
        addDropZone(ref, data) { this.dropZone.push({ref, data}) },
        setStartFn(fn) { this._startFn = fn },
        setSuccessFn(fn) { this._successFn = fn },
        setFailedFn(fn) { this._failedFn = fn },
        setEnterFn(fn) { this._dropEnterFn = fn },
        setLeaveFn(fn) { this._dropLeaveFn = fn },
        dragStartHandler(event, item) {
            this._item = {el: event.target, data: item}
            this._from = this.activeDropZone(event.target)
            this._to = this.inactiveDropZone(event.target)
            this._startFn({
                item: this._item?.data,
                from: this._from?.data,
                to: this._to?.data
            })
        },
        dragEndHandler() {
            if (this._isOnDropZone) {
                this._successFn && (this._successFn({
                    item: this._item?.data,
                    from: this._from?.data,
                    to: this._to?.data
                }))
            } else {
                this._failedFn && (this._failedFn({
                    item: this._item?.data,
                    from: this._from?.data,
                    to: this._to?.data
                }))
            }
            setTimeout(() => {
                this.dragReset()
            }, 500)
        },

        activeDropZone(target) {
            return this.dropZone.filter(({ ref }) => ref.contains(target)).at(0)
        },
        inactiveDropZone(target) {
            return this.dropZone.filter(({ ref }) => !ref.contains(target)).at(0)
        },
        dragReset() {
            this._item = null
            this._activeItem = null
            this._isOnDropZone = false
        }
    },
} 
