import React, { useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';

import LoadingIndicator from '../LoadingIndicator';
import PlayIcon from '../PlayIcon';
import Wrapper from './Wrapper';
import CanvasWrapper from './CanvasWrapper';
import Duration from '../Duration';

import reducer, { initialState } from './reducer';

const VideoPreview = ({ src }) => {
  const [reducerState, dispatch] = useReducer(reducer, initialState);
  const { duration, dataLoaded, isHover, metadataLoaded, snapshot, seeked } = reducerState.toJS();

  const canvasRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    const getSnapshot = () => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const thumbnail = canvas.toDataURL('image/png');

        video.src = ''; // setting to empty string stops video from loading

        dispatch({
          type: 'SET_SNAPSHOT',
          snapshot: thumbnail,
        });
      } catch (e) {
        console.error(e);
      }
    };

    if (dataLoaded && metadataLoaded && videoRef.current) {
      videoRef.current.currentTime = 0;

      if (seeked && !snapshot) {
        getSnapshot();
      }
    }
  }, [dataLoaded, metadataLoaded, seeked, snapshot]);

  const toggleHover = () => {
    dispatch({
      type: 'SET_IS_HOVER',
    });
  };

  return (
    <Wrapper onMouseEnter={toggleHover} onMouseLeave={toggleHover}>
      <video
        muted
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        onLoadedMetadata={() => {
          dispatch({
            type: 'METADATA_LOADED',
          });
        }}
        onLoadedData={({ target: { duration } }) => {
          dispatch({
            type: 'DATA_LOADED',
            duration,
          });
        }}
        onSeeked={() => {
          dispatch({
            type: 'SEEKED',
          });
        }}
      />
      {!snapshot && <LoadingIndicator />}
      <CanvasWrapper>
        <canvas ref={canvasRef} />
        <Duration duration={duration} />
        {isHover && <PlayIcon small />}
      </CanvasWrapper>
    </Wrapper>
  );
};

VideoPreview.defaultProps = {
  src: null,
};

VideoPreview.propTypes = {
  src: PropTypes.string,
};

export default VideoPreview;
