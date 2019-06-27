# antd 组件封装


## React 组件封装
总结基于redux组件封装的几个注意事项

- 无状态：内部不使用state（不可避免例外），数据全部从props获取，尽量定义无状态组件
- 不发送ajax请求：组件内部不要使用ajax获取数据，数据和loading状态都通过props传入
- 简化接口：优化传入的props，props个数尽量少，props命名语义化
- 合理默认props
- 定义propTypes
- props单个定义，不要使用options之类的对象，封装不相干的props
- 使用`shouldComponentUpdate(nextProps, nextState)`优化组件性能
- 无副作用：组件只处理展示数据，无其他副作用，比如操作Storage等，发送ajx等。
- 不要封装需求多样化的组件，比如列表页的查询条件组件，组合情况太多，条件太复杂，如果封装了，对组件的维护成本较高。或者只做最常用情况的封装。
