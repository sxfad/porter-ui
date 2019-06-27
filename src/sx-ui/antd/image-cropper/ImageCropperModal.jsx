import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'antd';
import ImageCropper from './ImageCropper';

export default class ImageCropperModal extends Component {
    static defaultProps = {
        onOK: () => {
        },
        width: 800,
        height: 500,
        className: '',
    }
    static propTypes = {
        src: PropTypes.string,
        width: PropTypes.number,
        height: PropTypes.number,
        onOK: PropTypes.func,
    }
    state = {
        visible: false,
    }
    handleCancel = () => {
        this.setState({visible: false});
    }
    handleClick = () => {
        this.setState({visible: true});
    }

    render() {
        const {children, src, onOK, width, height, className} = this.props;
        return (
            <span className={className}>
                <span onClick={this.handleClick}>
                    {children}
                </span>
                <Modal
                    title="编辑图片"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer=""
                    width={width + 32}
                >
                    <ImageCropper
                        src={src}
                        width={width}
                        height={height}
                        onOK={data => {
                            this.handleCancel();
                            onOK(data);
                        }}/>
                </Modal>
            </span>
        );
    }
}
