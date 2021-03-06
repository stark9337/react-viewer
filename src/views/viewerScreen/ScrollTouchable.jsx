import React from 'react';
import PropTypes from 'prop-types';
import { ViewerType } from '../../constants/ViewerScreenConstants';

const ScrollTouchable = (props) => {
  const {
    children,
    onTouched,
    contentType,
    footer,
    TouchableScreen,
    SizingWrapper,
    viewerType,
  } = props;
  return (
    <TouchableScreen
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onTouched();
      }}
    >
      <SizingWrapper
        contentType={contentType}
        viewerType={viewerType}
      >
        {children}
      </SizingWrapper>
      {footer}
    </TouchableScreen>
  );
};

ScrollTouchable.propTypes = {
  children: PropTypes.node,
  onTouched: PropTypes.func,
  contentType: PropTypes.number,
  viewerType: PropTypes.oneOf(ViewerType.toList()),
  footer: PropTypes.node,
  TouchableScreen: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  SizingWrapper: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};
ScrollTouchable.defaultProps = {
  footer: null,
};

export default ScrollTouchable;
