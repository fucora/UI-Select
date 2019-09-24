# UI-Select
百分之百原创设计的前端用户界面组件之选择框组件
实现单选，多选，树形多层级选择，重复有序选择，不重复选择，父节点是否能选等交互的组件。

## 组件生命周期

1. 调用$("#XXX").select()创建UI界面,返回Select对象
2. 调用select.setDataSource()传入JSON数据，对组件进行重新渲染，清除已选择区域已选中词条，绑定选项触发事件
3. 鼠标单击已选择区域，展开下拉面板，显示备选项树形UI界面。
4. 在下拉面板中的搜索栏输入筛选条件，触发过滤事件，只展示符合条件的备选项。
5. 单击备选项进行备选项选中，并在已选择区域渲染显示已选中词条。单击右侧树形展开按钮，显示当前节点下级备选项列表。
6. 单击页面中非当前组件的空白区，隐藏下拉面板。
7. 单击已选择区域右侧的刷新按钮，调用数据源函数，执行第2步过程。


## 特性
Select组件为Skeleton4j项目定制的前端组件，支持各种特殊功能。

### 级联支持
级联情况下，数据源由静态数据源，模式为本地模式，以JSON对象或者JSON字符串通过setDataSource(json)设置。

### 数据源支持
组件可运行在本地模式和远程模式下，本地模式用用于静态数据源的设置，远程模式用于搜索方式的交互数据模式。
UI界面中的搜索框支持本地数据过滤和远程数据搜索功能，根据模式的不同展示不同，本地模式展示为过滤图标；远程模式展示为搜索图标。

### 表单支持
组件可工作在传统的表单模式,以下代码构建一个表单，拥有两个选择框组件。
```html
<!DOCTYPE html>
<html>

	<head>
		<meta charset="UTF-8">
		<title>表单提交</title>
		<link href="../select.css" rel="stylesheet" />
	</head>

	<body>
		<form action="test.do">
			<!--表单包裹层-->
			<div style="width: 360px; margin: 10px;">
				<div class="select-ui" id="xxx"></div>
			</div>
			<!--表单包裹层-->
			<div style="width: 360px; margin: 10px;">
				<div class="select-ui" id="yyy"></div>
			</div>
			<input type="submit"/>
		</form>
	</body>
	<script>
		var data = {
			"nodes": [{
					"text": "重庆市",
					"value": "023",
					"selected": false,
					"nodes": null
				}, 
				{
					"text": "北京市",
					"value": "010",
					"selected": false,
					"nodes": null
				}]
		};
		var select1 = $("#xxx").select()
								.setDateSource(data);
								
		var select2 = $("#yyy").select({multiple:true})
								.setDateSource(data);
	</script>
</html>
```
GET模式下提交数据链接为
```
xxx=023&yyy=023&yyy=010
```


## 组件UI界面

## 组件参数
| 参数名          | 数据类型 | 描述                                          |
| --------------- | -------- | --------------------------------------------- |
| width           | string   | 100px或25%                                    |
| multiple        | boolean  | 是否多选，默认单选                            |
| duplicate		  |boolean  | 是否可以对同一选项重复选择  |
| selectParent	  |boolean  | 是否可以选择非叶子节点的父节点作为选项 |
| placeholder     | string   | 占位提示信息                                |
| allowClear      | boolean  | 是否显示刷新按钮 								|
| closeOnSelect   | boolean  | 是否选中后关闭选择框，默认true                |
| disabled        | boolean  | 是否失效                                      |
| readonly        | boolean  | 是否只读                                      |

## 组件API

| 方法             | 描述                                                       |      |
| ---------------- | ---------------------------------------------------------- | ---- |
| select          | 用于创建一个Select组件，可选传入回调函数                  |      |
| setDataSource    | 以JSON形式设置数据源，用于第一次初始化时                   |      |
| getDataSource    | 获取当前展示选项对应的数据源JSON                           |      |
| setSelectedValue | 设置获取选中的选项对应的代码值，展示结果为设置的代码值数组 |      |
| getSelectedValue | 获取选中的选项对应的代码值                                 |      |
| getSelectedText  | 获取选中的选项对应的文本数组                               |      |
| getOptions       | 获取所有选项的代码值和文本数组                             |      |
| draw             | 重新绘制组件UI界面                                         |      |
| cleanOptions     | 清空所有选项，同时清空数据源值                             |      |