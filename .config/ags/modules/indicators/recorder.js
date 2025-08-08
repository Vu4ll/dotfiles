const { Gio, GLib } = imports.gi;
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import PopupWindow from '../.widgethacks/popupwindow.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
const { execAsync } = Utils;
const { Box, Button, Label } = Widget;
import { setupCursorHover } from '../.widgetutils/cursorhover.js';
import { MaterialIcon } from '../.commonwidgets/materialicon.js';
import { RoundedCorner } from '../.commonwidgets/cairo_roundedcorner.js';
const elevate = userOptions.asyncGet().etc.widgetCorners ? "record-rounding" : "elevation" ;

const isRecording = Variable(false);
const isPaused = Variable(false);
const isMicEnabled = Variable(true); 
const isSystemAudioEnabled = Variable(true);
const isScreen = Variable(true);
const isHD = Variable(false);

let outputFile = '';

const MICROPHONE_SOURCE = 'alsa_input.pci-0000_00_1f.3.analog-stereo';
const SYSTEM_AUDIO_SOURCE = 'alsa_output.pci-0000_00_1f.3.analog-stereo.monitor';

const RecordIcon = () => MaterialIcon(
    isRecording.bind().transform(v => v ? 'stop_circle' : 'video_camera_front'), 
    'large'
);

const PauseIcon = () => MaterialIcon(
    isPaused.bind().transform(v => v ? 'play_arrow' : 'pause'), 
    'large'
);

const QualityIcon = () => MaterialIcon(
    isHD.bind().transform(v => v ? 'high_quality' : 'sd'), 
    'large'
);

const MicrophoneIcon = () => MaterialIcon(
    isMicEnabled.bind().transform(v => v ? 'mic' : 'mic_off'), 
    'large'
);

const ScreenIcon = () => MaterialIcon(
    isScreen.bind().transform(v => v ? 'desktop_windows' : 'crop_free'), 
    'large'
);

const SystemAudioIcon = () => MaterialIcon(
    isSystemAudioEnabled.bind().transform(v => v ? 'volume_up' : 'volume_off'), 
    'large'
);

const buildRecordingCommand = () => {
    const cmd = ['wf-recorder'];
    const recordingPath = GLib.get_home_dir() + (userOptions.asyncGet().etc.recordingPath || '/Videos/');
    outputFile = recordingPath + `${Date.now()}.mp4`;
    
    if (isMicEnabled.value && isSystemAudioEnabled.value) {
        cmd.push('-a');
    } else if (isMicEnabled.value) {
        cmd.push('--audio=' + MICROPHONE_SOURCE);
    } else if (isSystemAudioEnabled.value) {
        cmd.push('--audio=' + SYSTEM_AUDIO_SOURCE);
    }
    
    if (isHD.value) {
        cmd.push('--codec=libx264');
        cmd.push('-p');
        cmd.push('tune=zerolatency');
    }
    
    cmd.push('-f');
    cmd.push(outputFile);
    
    return cmd;
};

const showRecordingNotification = () => {
    const details = [];
    details.push(`Microphone: ${isMicEnabled.value ? 'ON' : 'OFF'}`);
    
    details.push(`System Audio: ${isSystemAudioEnabled.value ? 'ON' : 'OFF'}`);
    
    details.push(`Quality: ${isHD.value ? 'HD' : 'Standard'}`);
    
    details.push(`Mode: ${isScreen.value ? 'Full Screen' : 'Area Selection'}`);
    
    details.push(`Saving to: ${outputFile}`);
    
    execAsync(`notify-send "Recording started" "${details.join('\n')}" -i video-display`)
        .catch(console.error);
};

const startRecording = () => {
    isRecording.value = true;
    isPaused.value = false;
    
    const cmd = buildRecordingCommand();
    
    App.closeWindow('recorder');
    
    if (!isScreen.value) {
        execAsync(`notify-send "Area Selection" "Select an area to record" -i video-display`)
            .then(() => {
                return execAsync(['slurp']).then(geometry => {
                    cmd.push('-g');
                    cmd.push(geometry.trim());
                    
                    console.log("Record command (area):", cmd.join(' '));
                    
                    showRecordingNotification();
                    
                    return execAsync(cmd);
                });
            })
            .catch(error => {
                console.error("Failed to start recording:", error);
                execAsync(`notify-send "Recording failed" "Error: ${error}" -i error`);
                isRecording.value = false;
            });
    } else {
        console.log("Record command (fullscreen):", cmd.join(' '));
        
        execAsync(cmd)
            .catch(error => {
                console.error("Failed to start recording:", error);
                execAsync(`notify-send "Recording failed" "Error: ${error}" -i error`);
                isRecording.value = false;
            });
            
        showRecordingNotification();
    }
};

const togglePauseResume = () => {
    if (!isRecording.value) return;
    
    const signal = isPaused.value ? '-CONT' : '-STOP';
    execAsync(`killall ${signal} wf-recorder`)
        .then(() => isPaused.value = !isPaused.value)
        .catch(console.error);
    
    const message = isPaused.value ? "Recording paused" : "Recording resumed";
    execAsync(`notify-send "${message}" "Recording to ${outputFile}" -i video-display`)
        .catch(console.error);
};

const stopRecording = () => {
    if (!isRecording.value) return;
    
    execAsync('killall wf-recorder')
        .then(() => {
            isRecording.value = false;
            isPaused.value = false;
            return execAsync(`notify-send "Recording stopped" "Saved to ${outputFile}" -i video-display`);
        })
        .catch(console.error);
};

const toggleSystemAudio = () => {
    isSystemAudioEnabled.value = !isSystemAudioEnabled.value;
    
    const message = isSystemAudioEnabled.value ? 
        "System audio enabled" : 
        "System audio disabled";
    
    execAsync(`notify-send "${message}" "System audio will ${isSystemAudioEnabled.value ? '' : 'NOT'} be recorded" -i ${isSystemAudioEnabled.value ? 'audio-volume-high' : 'audio-volume-muted'}`)
        .catch(console.error);
        
    if (isRecording.value) {
        execAsync(`notify-send "Note" "System audio changes will apply to next recording" -i info`)
            .catch(console.error);
    }
};

const toggleMicrophone = () => {
    isMicEnabled.value = !isMicEnabled.value;
    
    const message = isMicEnabled.value ? "Microphone enabled" : "Microphone disabled";
    const icon = isMicEnabled.value ? "audio-input-microphone" : "microphone-disabled";
    
    execAsync(`notify-send "${message}" "Microphone will ${isMicEnabled.value ? '' : 'NOT'} be used in recording" -i ${icon}`)
        .catch(console.error);
        
    if (isRecording.value) {
        execAsync(`notify-send "Note" "Microphone changes will apply to next recording" -i info`)
            .catch(console.error);
    }
};

const toggleQuality = () => {
    isHD.value = !isHD.value;
    
    const message = isHD.value ? "High quality enabled" : "Standard quality enabled";
    execAsync(`notify-send "${message}" "Recording will be in ${isHD.value ? 'high' : 'standard'} quality" -i preferences-desktop-display`)
        .catch(console.error);
    
    if (isRecording.value) {
        execAsync(`notify-send "Note" "Quality changes will apply to next recording" -i info`)
            .catch(console.error);
    }
};

const toggleScreenMode = () => {
    isScreen.value = !isScreen.value;
    
    const message = isScreen.value ? "Full screen mode" : "Area selection mode";
    execAsync(`notify-send "${message}" "Recording will capture ${isScreen.value ? 'entire screen' : 'selected area'}" -i video-display`)
        .catch(console.error);
    
    if (isRecording.value) {
        execAsync(`notify-send "Note" "Screen mode changes will apply to next recording" -i info`)
            .catch(console.error);
    }
};

const recordButton = Button({
    className: 'recorder-btn-red',
    onClicked: () => isRecording.value ? stopRecording() : startRecording(),
    child: RecordIcon(),
    tooltipText: 'Start/Stop recording',
    setup: setupCursorHover,
});

const pauseButton = Button({
    className: 'recorder-btn',
    onClicked: togglePauseResume,
    child: PauseIcon(),
    tooltipText: 'Pause/Resume recording',
    setup: setupCursorHover,
});

const qualityButton = Button({
    className: 'recorder-btn',
    onClicked: toggleQuality,
    child: QualityIcon(),
    tooltipText: 'Toggle recording quality',
    setup: setupCursorHover,
});

const microphoneButton = Button({
    className: 'recorder-btn',
    onClicked: toggleMicrophone,
    child: MicrophoneIcon(),
    tooltipText: 'Toggle microphone',
    setup: setupCursorHover,
});

const screenButton = Button({
    className: 'recorder-btn',
    onClicked: toggleScreenMode,
    child: ScreenIcon(),
    tooltipText: 'Toggle screen/area recording',
    setup: setupCursorHover,
});

const systemAudioButton = Button({
    className: 'recorder-btn',
    onClicked: toggleSystemAudio,
    child: SystemAudioIcon(),
    tooltipText: 'Toggle system audio recording',
    setup: setupCursorHover,
});

export default () => PopupWindow({
    name: 'recorder',
    anchor: ['top', 'right', 'bottom'],
    layer: 'top',
    child: Box({
        vpack: 'center',
        vertical: true,
        children: [
            userOptions.asyncGet().etc.widgetCorners ? RoundedCorner('bottomright', {
                hpack: "end",
                className: 'corner corner-colorscheme'
            }) : null,
            Box({
                vpack: 'center',
                className: "recorder-bg " + elevate,
                vertical: true,
                css: `
                    .recorder-btn, .recorder-btn-red {
                        min-width: 48px;
                        min-height: 48px;
                        margin: 4px;
                        border-radius: 24px;
                    }
                `,
                children: [
                    Box({
                        vertical: true,
                        vpack: 'center',
                        spacing: 10,
                        children: [
                            recordButton,
                            pauseButton,
                            qualityButton,
                            microphoneButton,
                            screenButton,
                            systemAudioButton,
                        ]
                    })
                ],
            }),
            userOptions.asyncGet().etc.widgetCorners ? RoundedCorner('topright', {
                hpack: "end",
                className: 'corner corner-colorscheme'
            }) : null,
        ],
    }),
});
