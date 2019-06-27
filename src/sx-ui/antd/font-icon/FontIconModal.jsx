import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Modal} from 'antd';
import FontIcon from './FontIcon';
import FontIconSelector from './FontIconSelector';

export default class FontIconModal extends Component {
    static defaultProps = {
        size: 'large',
        disabled: false,
        buttonType: 'ghost',
        onSelect: () => {
        },
        height: 400,
        width: 645,
        showPreview: true,
        value: '',
    }
    static propsType = {
        value: PropTypes.string,
        size: PropTypes.string,
        disabled: PropTypes.boolean,
        onSelect: PropTypes.func,
    }

    state = {
        iconModalVisible: false,
        selectedIcon: '',
    }

    handleIconModalOk = () => {
        const {selectedIcon} = this.state;

        this.props.onSelect(selectedIcon);

        this.setState({iconModalVisible: false});
    }

    handleSelectIcon = selectedIcon => {
        this.setState({selectedIcon});
    }

    render() {
        const {value, size, disabled, buttonType, height, width, showPreview} = this.props;
        const {iconModalVisible} = this.state;
        return (
            <div className="font-icon-modal-wrap">
                <div className="font-button">
                    <Button
                        type={buttonType}
                        size={size}
                        onClick={() => this.setState({iconModalVisible: true})}
                        disabled={disabled}
                    >
                        {
                            showPreview ?
                                <FontIcon type={value}/>
                                : null
                        }
                        选取图标
                    </Button>
                </div>
                <Modal
                    width={width}
                    visible={iconModalVisible}
                    title="选择一个图标"
                    okText="确定"
                    onCancel={() => this.setState({iconModalVisible: false})}
                    onOk={this.handleIconModalOk}
                >
                    <div>
                        <FontIconSelector onSelect={this.handleSelectIcon} height={height}/>
                    </div>
                </Modal>
            </div>
        );
    }
}
