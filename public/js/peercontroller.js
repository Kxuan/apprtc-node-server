/**
 * Peer Controller
 * @param {PeerConnectionClient} pc
 * @constructor
 *
 * @event layoutChanged Emit on layout is changed
 */
function PeerController(pc) {
    if (pc.ui) {
        throw new Error("Duplicate PeerController on same PeerConnectionClient");
    }
    pc.ui = this;
    var remoteVideo = pc.getRemoteVideo();
    this.el = this.createPeerElement();
    this.el.peerId.innerText = pc.peerId;
    this.el.peerId.title = pc.peerId;

    if (remoteVideo) {
        this.attachVideo(remoteVideo);
    }
}
EventEmitter.bindPrototype(PeerController);
PeerController.prototype.getVideoStream = function () {
    return this.videoStream || null;
};
PeerController.prototype.getRootElement = function () {
    return this.el.root;
};
PeerController.prototype.getVideoElement = function () {
    return this.el.video;
};
PeerController.prototype.getVideoWrapper = function () {
    return this.el.wrapper;
};
PeerController.prototype.attachVideo = function (videoStream) {
    if (this.videoStream) {
        throw new Error("Already attached a video stream");
    }
    var el = this.el;

    this.videoStream = videoStream;
    el.backText.innerText = "等待视频源";
    if (el.video.readyState <= 2) {
        var listener = function () {
            el.video.removeEventListener('canplay', listener);
            delete this.canplayListener;
        }.bind(this);
        this.canplayListener = listener;
        el.video.addEventListener('canplay', listener);
    }
    el.root.style.cursor = 'pointer';

    attachMediaStream(el.video, videoStream);

};
PeerController.prototype.detachVideo = function () {
    if (!this.videoStream) {
        return;
    }

    var el = this.el;

    el.backText.innerText = "无视频源";
    if (this.canplayListener) {
        el.video.removeEventListener('canplay', this.canplayListener);
        delete this.canplayListener;
    }
    el.root.style.cursor = 'not-allowed';

    attachMediaStream(el.video, null);
    delete this.videoStream;
};

PeerController.prototype.destroyRemotePeer = function () {
    for (var name in this.el) {
        var el = this.el[name];
        if (el instanceof HTMLElement && el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
};


//创建对端HTML面板
PeerController.prototype.createPeerElement = function () {
    var self = this;

    var el           = document.createElement('div'),
        elBackground = document.createElement('div'),
        elBackText   = document.createElement('div'),
        elWrapper    = document.createElement('div'),
        elVideo      = document.createElement('video'),
        elControl    = document.createElement('div'),
        elPeerId     = document.createElement('a');
    el.className = 'peer';
    elBackground.className = 'background';
    elBackText.className = 'background-text';
    elWrapper.className = 'wrapper';
    elControl.className = 'control-box';
    elPeerId.className = 'peerName';


    elVideo.autoplay = true;
    var oldWidth, oldHeight;
    elVideo.onprogress = function (p) {
        if (this.readyState > 2) {
            if (this.videoWidth != oldWidth || this.videoHeight != oldHeight) {
                oldWidth = this.videoWidth;
                oldHeight = this.videoHeight;
                self.emit("layoutChange");
            }
            el.style.width = ((this.videoWidth / this.videoHeight) * el.clientHeight) + 'px';
            elBackText.innerText = "已全屏";
        }
    };

    el.style.width = '100px';
    elBackText.innerText = "无视频";

    el.addEventListener('click', function () {
        if (elVideo.src) {
            this.currentFullPageUI = ui;
            this.updateLayout();
        } else {
            showAlert("无视频源");
        }
    }.bind(this));

    elBackground.appendChild(elBackText);
    elWrapper.appendChild(elVideo);
    elControl.appendChild(elPeerId);
    el.appendChild(elBackground);
    el.appendChild(elWrapper);
    el.appendChild(elControl);
    return {root: el, wrapper: elWrapper, video: elVideo, peerId: elPeerId, backText: elBackText};
};