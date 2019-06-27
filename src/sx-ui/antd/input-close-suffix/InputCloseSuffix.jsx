import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'antd';

export default class InputCloseSuffix extends Component {
    static defaultProps = {
        form: null,
        field: '',
        dom: null,
        onEmpty: () => {
        },
    }
    static propTypes = {
        form: PropTypes.object,
        field: PropTypes.string,
        dom: PropTypes.object,
        onEmpty: PropTypes.func,
    };

    handleEmpty = () => {
        const {dom, field, onEmpty, form} = this.props;
        if (form && field) {
            const {setFieldsValue} = form;
            setFieldsValue({[field]: ''});
        } else if (dom) {
            dom.refs.input.value = '';
        }
        if (dom) dom.focus();
        onEmpty();
    }

    render() {
        const {field, form, dom} = this.props;
        let value = '';
        if (field && form) {
            const {getFieldValue} = form;
            value = getFieldValue(field);
        } else if (dom) {
            value = dom.refs.input.value;
        }
        return value ?
            (<Icon
                type="close-circle" style={{cursor: 'pointer'}}
                onClick={this.handleEmpty}/>)
            : null;
    }
}
