import React, {Component} from 'react';
import PropTypes from 'prop-types';
import assign from 'object-assign';
import {Pagination} from 'antd';
import './style.less';

export default class PaginationComponent extends Component {
    static defaultProps = {
        showSizeChanger: true,
        showQuickJumper: true,
        showMessage: true,
        pageSize: 10,
        pageNum: 1,
        total: 0,
        onPageNumChange() {
        },
        onPageSizeChange() {
        },
    };

    static propTypes = {
        showSizeChanger: PropTypes.bool,
        showQuickJumper: PropTypes.bool,
        showMessage: PropTypes.bool,
        pageSize: PropTypes.number,
        pageNum: PropTypes.number,
        total: PropTypes.number,
        onPageNumChange: PropTypes.func,
        onPageSizeChange: PropTypes.func,
    }

    render() {
        const {
            showSizeChanger,
            showQuickJumper,
            showMessage,
            pageSize,
            pageNum,
            total,
            onPageNumChange,
            onPageSizeChange,
        } = this.props;

        const props = {};
        if (showSizeChanger) {
            props.showSizeChanger = true;
        }
        if (showQuickJumper) {
            props.showQuickJumper = true;
        }

        const totalPage = Math.ceil(total / pageSize);
        let style = this.props.style;
        if (total <= 0) {
            style = assign({}, /* {display: 'none'}, */ style);
        }
        return (
            <div className="pagination-component" style={style}>
                <div className="pagination-wrap">
                    <Pagination
                        {...props}
                        pageSizeOptions={['10', '20', '30', '40', '50', '80', '100']}
                        onShowSizeChange={(num, size) => onPageSizeChange(size)}
                        onChange={(num) => onPageNumChange(num)}
                        defaultCurrent={1}
                        pageSize={pageSize}
                        current={pageNum}
                        total={total}/>
                    {showMessage ?
                        <div className="total-count">
                            共{totalPage}页 {total}条数据
                        </div>
                        : ''
                    }
                </div>
                <div style={{clear: 'both'}}/>
            </div>
        );
    }
}
