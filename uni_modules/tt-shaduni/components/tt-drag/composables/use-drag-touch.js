import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
function useDragTouch(options, emit, onDeleteProp) {
  const {
    mode,
    disabled,
    showDragHandle,
    scale: scaleProp,
    opacity: opacityProp,
    longPressDuration,
    swipeThreshold,
    cols,
    itemWidthPx,
    itemHeightPx,
    dragList,
    isChangeEnabled,
    setChangeStatus,
    getItemValue,
    updateItemPosition,
    updateIndexMap,
    changeItemPosition,
    emitChange,
    deleteItemHandle
  } = options;
  const tempItem = ref(null);
  let previewStatus = true;
  let longPressTimer = null;
  let timer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  function clearAllTimers() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function touchstart(e, item) {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
    if (showDragHandle.value && mode.value === "single") return;
    if (disabled.value || item.draggable === false) return;
    clearAllTimers();
    dragList.value.forEach((v) => {
      v._zIndex = v._index + 9;
    });
    item._zIndex = 99;
    item._moveEnd = true;
    tempItem.value = item;
    longPressTimer = setTimeout(() => {
      item._disabled = false;
      item._scale = scaleProp.value;
      item._opacity = opacityProp.value;
      longPressTimer = null;
    }, longPressDuration.value);
  }
  function touchend(e, item) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
    }
    if (showDragHandle.value && mode.value === "single") return;
    const wasWaitingForLongPress = !!longPressTimer;
    clearAllTimers();
    if (mode.value === "image" && wasWaitingForLongPress) {
      previewImage(item, true);
    }
    item._scale = 1;
    item._opacity = 1;
    item._x = item._oldX;
    item._y = item._oldY;
    item._offset = 0;
    item._moveEnd = false;
    setTimeout(() => {
      item._disabled = true;
      nextTick(() => {
        item._x = item._absX * itemWidthPx.value;
        item._y = item._absY * itemHeightPx.value;
        item._oldX = item._x;
        item._oldY = item._y;
        tempItem.value = null;
        setChangeStatus(true);
      });
    }, 150);
  }
  function onChange(e, item) {
    if (!item) return;
    item._oldX = e.detail.x;
    item._oldY = e.detail.y;
    if (e.detail.source === "touch") {
      if (item._moveEnd) {
        item._offset = Math.sqrt(
          Math.pow(item._oldX - item._absX * itemWidthPx.value, 2) + Math.pow(item._oldY - item._absY * itemHeightPx.value, 2)
        );
      }
      let x = Math.floor((e.detail.x + itemWidthPx.value / 2) / itemWidthPx.value);
      if (mode.value !== "single" && x >= cols.value) return;
      let y = Math.floor((e.detail.y + itemHeightPx.value / 2) / itemHeightPx.value);
      let newIndex = mode.value === "single" ? y : cols.value * y + x;
      if (item._index !== newIndex && newIndex < dragList.value.length) {
        dragList.value.forEach((obj) => {
          if (item._index > newIndex && obj._index >= newIndex && obj._index < item._index) {
            changeItemPosition(obj, 1);
          } else if (item._index < newIndex && obj._index <= newIndex && obj._index > item._index) {
            changeItemPosition(obj, -1);
          } else if (obj._dragId !== item._dragId) {
            obj._offset = 0;
            obj._x = obj._oldX;
            obj._y = obj._oldY;
            updateItemPosition(obj);
          }
        });
        item._index = newIndex;
        item._absX = mode.value === "single" ? 0 : x;
        item._absY = y;
        if (!item._moveEnd) updateItemPosition(item);
        updateIndexMap();
        emitChange(emit);
      }
    }
  }
  function previewImage(item, isClick) {
    const moveDistance = Math.sqrt(
      Math.pow(touchEndX - touchStartX, 2) + Math.pow(touchEndY - touchStartY, 2)
    );
    const isSwipe = moveDistance > swipeThreshold.value;
    if (isClick && previewStatus && isChangeEnabled() && !isSwipe && item._offset < 28.28) {
      const sortedList = dragList.value.slice().sort((a, b) => a._index - b._index);
      const urls = sortedList.map((v) => getItemValue(v));
      let delay = 0;
      delay = 100;
      previewStatus = false;
      setTimeout(() => {
        uni.previewImage({
          urls,
          current: getItemValue(item),
          complete: () => {
            setTimeout(() => {
              previewStatus = true;
            }, 300);
          }
        });
      }, delay);
    }
  }
  function handleDragHandleTouchStart(item) {
    if (!(showDragHandle.value && mode.value === "single" && item)) return;
    item._disabled = false;
    dragList.value.forEach((v) => {
      v._zIndex = v._index + 9;
    });
    item._zIndex = 99;
    item._moveEnd = true;
    tempItem.value = item;
    item._scale = scaleProp.value;
    item._opacity = opacityProp.value;
  }
  function handleDragHandleTouchEnd(item) {
    if (!(showDragHandle.value && mode.value === "single" && item)) return;
    item._scale = 1;
    item._opacity = 1;
    item._x = item._oldX;
    item._y = item._oldY;
    item._offset = 0;
    item._moveEnd = false;
    setTimeout(() => {
      item._disabled = true;
      nextTick(() => {
        item._x = item._absX * itemWidthPx.value;
        item._y = item._absY * itemHeightPx.value;
        item._oldX = item._x;
        item._oldY = item._y;
        tempItem.value = null;
        setChangeStatus(true);
      });
    }, 150);
  }
  function handleContentTouchStart(e) {
    if (showDragHandle.value && mode.value === "single") e.stopPropagation();
  }
  function handleContentTouchMove(e) {
    if (showDragHandle.value && mode.value === "single") e.stopPropagation();
  }
  function handleContentTouchEnd(e) {
    if (showDragHandle.value && mode.value === "single") e.stopPropagation();
  }
  function mouseenter() {
  }
  function mouseleave() {
    clearAllTimers();
    const tempItemId = tempItem.value?._dragId;
    dragList.value.forEach((v) => {
      v._disabled = true;
      v._zIndex = v._index + 9;
      v._offset = 0;
      v._moveEnd = false;
      if (tempItemId && v._dragId === tempItemId) {
        v._scale = 1;
        v._opacity = 1;
        v._x = v._oldX;
        v._y = v._oldY;
        nextTick(() => {
          v._x = v._absX * itemWidthPx.value;
          v._y = v._absY * itemHeightPx.value;
          v._oldX = v._x;
          v._oldY = v._y;
        });
      }
    });
    tempItem.value = null;
    setChangeStatus(true);
  }
  function deleteItem(item, index) {
    if (onDeleteProp.value && typeof onDeleteProp.value === "function") {
      onDeleteProp.value(item, () => deleteItemHandle(item, index, emit));
    } else {
      deleteItemHandle(item, index, emit);
    }
  }
  function deleteItemMp(item, index) {
    deleteItem(item, index);
  }
  function nothing() {
  }
  let _docResetHandler = null;
  onMounted(() => {
    _docResetHandler = () => {
      if (!tempItem.value) {
        dragList.value.forEach((v) => {
          v._disabled = true;
          v._scale = 1;
          v._opacity = 1;
        });
      }
    };
    document.addEventListener("touchstart", _docResetHandler, { passive: true });
    document.addEventListener("mousedown", _docResetHandler);
  });
  onBeforeUnmount(() => {
    clearAllTimers();
    tempItem.value = null;
    if (_docResetHandler) {
      document.removeEventListener("touchstart", _docResetHandler);
      document.removeEventListener("mousedown", _docResetHandler);
    }
  });
  return {
    tempItem,
    touchstart,
    touchend,
    onChange,
    handleDragHandleTouchStart,
    handleDragHandleTouchEnd,
    handleContentTouchStart,
    handleContentTouchMove,
    handleContentTouchEnd,
    mouseenter,
    mouseleave,
    deleteItem,
    deleteItemMp,
    nothing
  };
}
export {
  useDragTouch
};
