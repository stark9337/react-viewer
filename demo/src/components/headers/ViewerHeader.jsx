import React from 'react';
import PropTypes from 'prop-types';


const ViewerHeader = ({ title, isVisible }) => (
  <header id="story_header">
    <nav className={`top_nav_bar viewer_header no_button ${isVisible ? 'active' : ''}`}>
      <div className="nav_first_line">
        <div className="page_title">
          <h2 className="title_text">
            {title}
          </h2>
        </div>
      </div>
      <hr className="clear_both" />
    </nav>
  </header>
);

ViewerHeader.propTypes = {
  title: PropTypes.string.isRequired,
  isVisible: PropTypes.bool,
};

ViewerHeader.defaultProps = {
  isVisible: true,
};

export default ViewerHeader;
