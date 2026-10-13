import React from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Dimensions } from 'react-native';
import { useGlobal } from '../../../state/global';

const screenWidth = Dimensions.get('window').width - 20;

const VideoPlayerUI = ({ uri, isPlay }) => {
    const { state } = useGlobal();
    const { isSocialPage } = state;
    const defaultRatio = 16 / 9; // Default aspect ratio for videos
    const height = screenWidth * defaultRatio;

    const player = useVideoPlayer({ uri: uri }, player => {
        player.loop = false;
    });

    React.useEffect(() => {
        if (isPlay && isSocialPage) {
            // player.play();
        } else {
            player.pause();
        }
    }, [isPlay, isSocialPage]);

    return (
        <VideoView
            source={{ uri }}
            style={{ width: screenWidth, height: height, borderRadius: 10, backgroundColor: '#000' }}
            player={player}
            fullscreenOptions={{ enable: true, orientation: 'landscape' }}
            allowsPictureInPicture
            muted
        />
    );
};

export default React.memo(VideoPlayerUI);
