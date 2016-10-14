//=============================================================================
// MPP_SimpleTouch.js
//=============================================================================
// Copyright (c) 2015 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【MMP ver.1.4】マウスやタッチ操作を変更します。
 * @author 木星ペンギン
 *
 * @help ●決定操作の変更
 * デフォルトでは左クリックした時にカーソル位置とマウスの位置が合っていれば決定、
 * 違っている場合はカーソル移動となっています。
 * 
 * 本プラグインを導入した場合、
 * ・左クリックを押した時点でカーソルが移動
 * ・左クリックを押したまま、上下移動でページのスクロール
 * ・スクロールさせず、すぐに左クリックを離すと決定
 * ・スクロール後と、左クリックをすぐ離さなかった場合は何もしない
 * に変更します。
 * 
 * これにより、一度のクリックで決定操作ができるだけでなく、
 * ページをスクロールさせようとして決定してしまう誤操作を
 * ある程度防ぐことができます。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Long Press Time
 * @desc 決定を取り消すまでの長押しの時間 (フレーム数)
 * @default 15
 * 
 */

(function() {
    
var parameters = PluginManager.parameters('MPP_SimpleTouch');
var longPressTime = Number(parameters['Long Press Time'] || 15);

Window_Selectable.prototype.processTouch = function() {
    if (this.isOpenAndActive()) {
        if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            this._touching = true;
            this._selecting = true;
            this._touchCount = 0;
        } else if (TouchInput.isCancelled()) {
            if (this.isCancelEnabled()) {
                this.processCancel();
            }
        }
        if (this._touching) {
            if (TouchInput.isTriggered()) {
                this.onTouch(false);
            } else if (TouchInput.isPressed()) {
                this._touchCount++;
                if (this.touchScroll() || this._touchCount >= longPressTime) {
                    this._selecting = false;
                }
            } else {
                if (this._selecting && this.isTouchedInsideFrame()) {
                    this.onTouch(true);
                }
                this._touching = false;
                this._selecting = false;
            }
        }
    }
};

Window_Selectable.prototype.touchScroll = function() {
    var lastRow = this.row();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    var hitIndex = this.hitTest2(x, y);
    if (hitIndex >= 0) {
        var hitRow = Math.floor(hitIndex / this.maxCols());
        this.setTopRow(lastRow - hitRow + this.topRow());
        return hitRow !== lastRow;
    }
    return false;
};

Window_Selectable.prototype.hitTest2 = function(x, y) {
    var cx = x - this.padding;
    var cy = y - this.padding;
    for (var i = 0; i < this.maxItems(); i++) {
        var rect = this.itemRect(i);
        var right = rect.x + rect.width;
        var bottom = rect.y + rect.height;
        if (cx >= rect.x && cy >= rect.y && cx < right && cy < bottom) {
            return i;
        }
    }
    return -1;
};

})();
