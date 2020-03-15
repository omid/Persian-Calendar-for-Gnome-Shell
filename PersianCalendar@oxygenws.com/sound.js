/* sound.js
 *
 * Copyright (C) 2017 Felipe Borges <felipeborges@gnome.org>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


const Gst = imports.gi.Gst;
const GstAudio = imports.gi.GstAudio;

const DEFAULT_VOLUME = 1;
Gst.init(null);
const SoundPlayer = class SoundPlayer {
    constructor(sound) {
        this.playbin = Gst.ElementFactory.make("playbin", sound.name);
        this.playbin.set_property("uri", this.getUri(sound));
        this.sink = Gst.ElementFactory.make("pulsesink", "sink");
        this.playbin.set_property("audio-sink", this.sink);

        this.prerolled = false;
        let bus = this.playbin.get_bus();
        bus.add_signal_watch();
        bus.connect("message", (bus, msg) => {
            if (msg != null) this._onMessageReceived(msg);
        });
    }

    isPlaying() {
        let [rv, state, pstate] = this.playbin.get_state(Gst.State.NULL);
        return state === Gst.State.PLAYING;
    }


    play() {
        this.playbin.set_state(Gst.State.PLAYING);

    }

    pause() {
        this.playbin.set_state(Gst.State.NULL);
        this.prerolled = false;
    }

    setVolume(value) {
        this.playbin.set_volume(GstAudio.StreamVolumeFormat.LINEAR, value);
        if (value == 0) {
            this.playbin.set_state(Gst.State.NULL);
        } else if (!this.isPlaying()) {
            this.play();
        }
    }

    _onMessageReceived(message) {
        if (message.type == Gst.MessageType.SEGMENT_DONE) {
            this.playbin.seek_simple(Gst.Format.TIME, Gst.SeekFlags.SEGMENT, 0);
        }
        if (message.type == Gst.MessageType.ASYNC_DONE) {
            if (!this.prerolled) {
                this.playbin.seek_simple(
                    Gst.Format.TIME,
                    Gst.SeekFlags.FLUSH | Gst.SeekFlags.SEGMENT,
                    0
                );
                this.prerolled = true;
            }
        }

        return true;
    }

    getUri(sound) {
        /* All URIs are relative to $HOME. */
        return Gst.filename_to_uri(sound.uri);
    }
};

var player = new SoundPlayer({name:"test",uri:".local/share/gnome-shell/extensions/PersianCalendar@oxygenws.com/sounds/azan.mp3"});