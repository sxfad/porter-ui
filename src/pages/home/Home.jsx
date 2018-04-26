import React, {Component} from 'react';
import {Row, Col, Card} from 'antd';
import {Link} from 'react-router';
import {PageContent} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import './style.less';

export const PAGE_ROUTE = '/';
export class LayoutComponent extends Component {
    state = {
        cardData: [],
    }

    componentWillReceiveProps(/* nextProps */) {
    }

    renderCard = ()=> {
        const {cardData} =this.state;
        const cardHtml = [];
        for (let i = 0; i < cardData.length; i++) {
            const cardMessagesHtml = [];
            for (let j = 0; j < cardData[i].messages.length; j++) {
                cardMessagesHtml.push(<div className="message-item"><span className="number">{j+1}</span><Link to={cardData[i].messages[j].linkUrl}>{cardData[i].messages[j].rowText}</Link></div>);
            }
            cardHtml.push(<Col span="8"><Card title={cardData[i].title} bordered={false}>{cardMessagesHtml}</Card></Col>);
        }

        return cardHtml;
    }

    componentWillMount() {
        // 随行付分布式数据同步中间件管理系统
        const {actions} = this.props;
        // actions.hidePageHeader();
        // actions.hideSideBar();
        actions.setPageTitle('Home');
        actions.setPageBreadcrumbs([
            {
                key: 'home',
                path: '',
                text: '首页',
                icon: 'home',
            },
        ]);

        promiseAjax.get(`/home/blocks`).then(rsp => {
            if (rsp.success) {
                this.setState({cardData: rsp.data})
            }
        })
    }

    render() {
        return (
            <PageContent className="home">
                <div style={{ background: '#ECECEC', padding: '30px' }} className="code-box-demo">
                    <Row>
                        {this.renderCard()}
                    </Row>
                </div>
            </PageContent>
        );
    }
}

export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}
