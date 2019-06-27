# 可编辑表格
> form 通过父级组件提供

## API
参数|必须|类型|默认值|说明
---|---|---|---|---
form | 是 | object| - | antd 中提供的form， 参见 [antd Form](https://ant.design/components/form-cn/)
field | 是 | string | - | 表单元素field，即：getFieldDecorator函数的第一个id参数
placeholder | 否 | string | - | 提示
type | 否 | string| 'input' | 编辑类型，默认input，还可以是：number textarea password mobile email select select-tree checkbox radio switch
decorator | 否 | object | {} | antd form的 getFieldDecorator 第二个参数
isRowEdit | 整行模式必须 | boolean | - | 是否是整行可编辑模式
showEdit | 整行模式必须 | boolean | - | 整行编辑模式时，编辑/非编辑形式切换
onSubmit | 单独模式必须 | function | - | 单独单元格编辑时，点击'对号'，表单无校验错误时，将触发此函数，整行编辑模式，此方法无效


## 单独单元格可编辑

```
// column 写法
{
    title: '描述',
    dataIndex: 'describe',
    key: 'describe',
    render: (text, record) => {
        const {form} = this.props;
        return (
            <EditableCell
                form={form}
                onSubmit={value => {
                    console.log(value); // 拿到编辑的结果
                }}
                field="describe"
                decorator={{
                    initialValue: record.describe,
                    rules: [
                        {required: true, message: '请输入描述！'},
                    ],
                }}
            />
        );
    },
},
```

## 整行可编辑写法

```
const newAddRowId = '12345678'; // 通过这个id来区分是否是新增列
// column 写法
{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => {
        const {form} = this.props;
        return (
            <EditableCell
                form={form}
                isRowEdit
                showEdit={record.isNewAddRow}
                field="name"
                decorator={{
                    initialValue: record.name,
                    rules: [
                        {required: true, message: '请输入名称！'},
                    ],
                }}
            />
        );
    },
},

// 操作列写法
{
    title: '操作',
    render: (text, record) => {
        if (record.isNewAddRow) {
            const items = [
                {
                    label: '保存',
                    onClick: () => {
                        this.handleSave(record);
                    },
                },
                {
                    label: '取消',
                    onClick: () => {
                        const data = [...this.state.data];
                        const newData = data.filter(item => !item.isNewAddRow);
                        this.setState({data: newData});
                    },
                },
            ];
            return <Operator items={items}/>;
        }
        const items = [
            {
                label: '删除',
                confirm: {
                    title: `您确定要删除${record.name}吗？`,
                    onConfirm: () => {
                        this.handleDelete(record);
                    },
                },
            },
        ];
        return <Operator items={items}/>;
    },
},

// 新增一行写法
handleAdd = () => {
    const newData = [...this.state.data];
    const isEditing = newData.find(item => item.isNewAddRow);
    if (isEditing) return;
    newData.unshift({
        id: new Date().getTime(), // 这个id给个随机即可
        name: '',
        describe: '',
        isNewAddRow: true,
    });
    this.setState({data: newData});
}

// 保存数据时，函数写法
handleSave = (record) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
            // TODO 保存数据到数据库，更新自定义分类多线下拉数据
            console.log(record, values);

            // TODO 根据后端返回数据，更新前端表格数据
            const data = [...this.state.data];
            const rowData = data.find(item => item.isNewAddRow);
            if (rowData) {
                delete rowData.isNewAddRow;
                rowData.id = new Date().getTime();
                rowData.name = values.name;
                rowData.describe = values.describe;
            }
            this.setState({data});
        }
    });
}
```

