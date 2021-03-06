import React from 'react';
import PropTypes from 'prop-types';
import {
  movePageViewer as movePageViewerAction,
  onViewerScreenTouched,
} from '../../redux/viewerScreen/ViewerScreen.action';
import { BindingType } from '../../constants/ContentConstants';
import { debounce, isExist } from '../../util/Util';
import PageCalculator from '../../util/viewerScreen/PageCalculator';
import ReadPositionHelper from '../../util/viewerScreen/ReadPositionHelper';
import PageTouchable from './PageTouchable';
import { renderImageOnErrorPlaceholder } from '../../util/DomHelper';
import AsyncTask from '../../util/AsyncTask';
import {
  selectBindingType, selectContentFormat,
  selectContentType, selectImages,
  selectIsLoadingCompleted,
  selectPageViewPagination,
  selectSpines,
  selectViewerReadPosition,
  selectViewerScreenSettings,
} from '../../redux/viewerScreen/ViewerScreen.selector';
import ViewerBaseScreen from './ViewerBaseScreen';
import DOMEventConstants from '../../constants/DOMEventConstants';
import { preventScrollEvent, removeScrollEvent } from '../../util/CommonUi';
import { setScrollTop } from '../../util/BrowserWrapper';
import DOMEventDelayConstants from '../../constants/DOMEventDelayConstants';
import { PAGE_VIEWER_SELECTOR } from '../../constants/StyledConstants';

class ViewerBasePageScreen extends ViewerBaseScreen {
  constructor() {
    super();
    this.resizeViewerFunc = debounce(() => this.resizeViewer(), DOMEventDelayConstants.RESIZE);
  }

  componentDidMount() {
    ReadPositionHelper.setScreenElement(document.querySelector(PAGE_VIEWER_SELECTOR));
    this.updatePagination(true);
    this.changeErrorImage();
    if (this.contentsComponent) {
      preventScrollEvent(this.contentsComponent);
    }
    if (this.pagesComponent) {
      preventScrollEvent(this.pagesComponent);
    }
    window.addEventListener(DOMEventConstants.RESIZE, this.resizeViewerFunc);
  }

  componentWillUnmount() {
    if (this.contentsComponent) {
      removeScrollEvent(this.contentsComponent);
      this.contentsComponent = null;
    }
    if (this.pagesComponent) {
      removeScrollEvent(this.pagesComponent);
      this.pagesComponent = null;
    }
    window.removeEventListener(DOMEventConstants.RESIZE, this.resizeViewerFunc);
  }

  componentWillReceiveProps(nextProps) {
    const { currentPage: nextPage } = nextProps.pageViewPagination;
    const { currentPage } = this.props.pageViewPagination;
    if (nextPage !== currentPage) {
      setScrollTop(0);
      PageCalculator.updatePagination();
    }
  }

  changeErrorImage() {
    const images = document.getElementsByTagName('img');
    const errorImage = renderImageOnErrorPlaceholder();
    if (images.length <= 0) {
      return;
    }
    for (let idx = 0; idx < images.length; idx += 1) {
      images[idx].addEventListener(DOMEventConstants.ERROR, (e) => {
        e.target.parentNode.replaceChild(errorImage, e.target);
      });
    }
  }

  resizeViewer() {
    if (!this.props.disablePageCalculation) {
      new AsyncTask(() => PageCalculator.updatePagination(true)).start(0);
    }
  }

  moveNextPage() {
    const { movePageViewer, pageViewPagination } = this.props;
    const { currentPage, totalPage } = pageViewPagination;

    const nextPage = currentPage + 1;
    if (nextPage > totalPage) {
      return;
    }
    movePageViewer(nextPage);
  }

  movePrevPage() {
    const {
      onMoveWrongDirection, bindingType, movePageViewer, pageViewPagination,
    } = this.props;
    const { currentPage } = pageViewPagination;
    const nextPage = currentPage - 1;
    if (nextPage <= 0) {
      if (bindingType === BindingType.RIGHT && isExist(onMoveWrongDirection)) {
        onMoveWrongDirection();
      }
      return;
    }
    movePageViewer(nextPage);
  }

  onScreenRef(ref) {
    const { screenRef } = this.props;
    if (isExist(screenRef)) {
      screenRef(ref);
    }
  }

  onLeftTouched() {
    const { bindingType } = this.props;
    if (bindingType === BindingType.RIGHT) {
      this.moveNextPage();
    } else {
      this.movePrevPage();
    }
  }

  onRightTouched() {
    const { bindingType } = this.props;
    if (bindingType === BindingType.RIGHT) {
      this.movePrevPage();
    } else {
      this.moveNextPage();
    }
  }

  updatePagination(restore) {
    if (!this.props.disablePageCalculation) {
      PageCalculator.updatePagination(restore);
    }
  }

  render() {
    const {
      contentType,
      isLoadingCompleted,
      viewerScreenTouched,
      footer,
      contentFooter,
      fontDomain,
      StyledContents,
      TouchableScreen,
      SizingWrapper,
    } = this.props;
    const {
      colorTheme,
      font,
      fontSizeLevel,
      paddingLevel,
      lineHeightLevel,
      contentWidthLevel,
      viewerType,
    } = this.props.viewerScreenSettings;

    if (!isLoadingCompleted) {
      return null;
    }

    return (
      <PageTouchable
        onLeftTouched={() => this.onLeftTouched()}
        onRightTouched={() => this.onRightTouched()}
        onMiddleTouched={() => viewerScreenTouched()}
        contentType={contentType}
        footer={footer}
        TouchableScreen={TouchableScreen}
        SizingWrapper={SizingWrapper}
        viewerType={viewerType}
      >
        <StyledContents
          id="viewer_contents"
          content={contentType}
          className={colorTheme}
          fontSizeLevel={fontSizeLevel}
          fontFamily={font}
          lineHeight={lineHeightLevel}
          comicWidthLevel={contentWidthLevel}
          paddingLevel={paddingLevel}
          contentType={contentType}
          innerRef={(comp) => { this.contentsComponent = comp; }}
          fontDomain={fontDomain}
        >
          <div
            className="pages"
            style={this.pageViewStyle()}
            ref={(comp) => { this.pagesComponent = comp; }}
          >
            {this.renderContent()}
            {contentFooter && <div className="content_footer" style={this.contentFooterStyle()}>{contentFooter}</div>}
          </div>
        </StyledContents>
      </PageTouchable>
    );
  }
}

ViewerBasePageScreen.propTypes = {
  onMoveWrongDirection: PropTypes.func,
  readPosition: PropTypes.string,
  pageViewPagination: PropTypes.object,
  viewerScreenTouched: PropTypes.func,
  movePageViewer: PropTypes.func,
  isDisableComment: PropTypes.bool,
  footer: PropTypes.node,
  contentFooter: PropTypes.node,
  screenRef: PropTypes.func,
  fontDomain: PropTypes.string,
  StyledContents: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  TouchableScreen: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  SizingWrapper: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  disablePageCalculation: PropTypes.bool,
};

const mapStateToProps = state => ({
  viewerScreenSettings: selectViewerScreenSettings(state),
  contentType: selectContentType(state),
  bindingType: selectBindingType(state),
  pageViewPagination: selectPageViewPagination(state),
  spines: selectSpines(state),
  images: selectImages(state),
  contentFormat: selectContentFormat(state),
  isLoadingCompleted: selectIsLoadingCompleted(state),
  readPosition: selectViewerReadPosition(state),
});

const mapDispatchToProps = dispatch => ({
  viewerScreenTouched: () => dispatch(onViewerScreenTouched()),
  movePageViewer: number => dispatch(movePageViewerAction(number)),
});

export default ViewerBasePageScreen;
export { mapStateToProps, mapDispatchToProps };
