;
'use strict';
/**
 * 向jQuery注册组件SearchView
 */
(function($, window) {
	/**
	 * 构建Select对象
	 * @param {Object} setting	配置对象
	 * @param {Object} funcDataSource	数据源函数
	 * @param {Object} funcShowMessage 消息显示函数
	 * @param {Object} funcClick	单击函数
	 * @param {Object} funcHover	悬浮函数
	 * @param {Object} funcMouseout	鼠标移出函数
	 */
	$.fn.select = function(_setting,
							   	_funcDataSource,
								_funcShowMessage,
							   	_funcClick,
							   	_funcHover,
							   	_funcMouseOut
							   ){
		//组件当前的DOM
		var setting;
		var self = $(this);
		var id = $(this).attr('id');
		var funcDataSource = _funcDataSource;
		var funcShowMessage;
		var funcClick = _funcClick;
		var funcHover = _funcHover;
		var funcMouseOut = _funcMouseOut;
		//已选中的选项
		var selectedValues = [];
		var pageNo = 1;
		var pageNum = 0;
		var pageSize = 20;
		var total = 0;
		setting = $.extend({}, {
				mode:'local',//本地模式
				placeholder:'',//占位符文本
				length: '200px',//界面宽度(单位百分数或者px)
				topOffset: 10,//界面下拉界面与展示框之间的间距(单位px)
				multiple:false,//是否可以多选
				selectParent:false,//是否可以选择父节点
				duplicate:false,//是否可以重复选
				disabled:false,//是否禁用
				readonly:false,//是否只读
				callIntervalMs: 1000,//调用接口的最小时间间隔（单位毫秒）
				enterSearch:false,//按enter键触发过滤，如果为假则任意键触发
				local:{
					searchPlaceholder : '请输入过滤词'
				},
				remote:{
					searchPlaceholder : '请输入搜索关键词'
				}
		}, _setting);
		
		if(!_funcShowMessage){
			funcShowMessage = function(message){
				alert(message);
			};
		}else{
			funcShowMessage = _funcShowMessage;
		}
		
		function Select(){
			
		}
		/**
		 * 绑定事件
		 */
		function _bindEvent(){
			var _this = this;
			self.find(".select-item").click(function() {
				var selectItem = $(this).parent("li");
			});
			$("#"+ id +"__items-box").find(".tree li>.unfold-icon").click(function(e) {
				e.stopPropagation(); //阻止事件冒泡  
				var node = $(this).parent("li");
				if(node.hasClass("tree-unfold")) {
					node.removeClass("tree-unfold");
					node.find(">ul").hide();
				} else {
					node.addClass("tree-unfold");
					node.find(">ul").show();
				}
			});
			$("#"+ id +"__items-box").find(".select-item").click(function(e) {
				e.stopPropagation(); //阻止事件冒泡
				var node = $(this).parent("li");
				//如果可以多选
				if(setting.multiple){
					//如果可以选择父节点
					if(setting.selectParent){
						//如果可以选择重复节点
						if(setting.duplicate){
							_select(node.data('value'), node.data('text'));
						}else{//如果不可以选择重复节点
							var selecteds = _getSelectedValue();
							if($.inArray(node.data('value'), selecteds) == -1){
								_select(node.data('value'), node.data('text'));
								node.hide();
								node.attr('disabled', 'disabled');
							}
						}
					}else{//如果不能选择父节点，单击项目并且有子节点的仅仅是展开或折叠
						if(node.find("ul>li .select-item").length > 0){
							if(node.hasClass("tree-unfold")) {//如果已展开，就折叠
								node.removeClass("tree-unfold");
								node.find(">ul").hide();
							} else {//如果处于折叠，就展开
								node.addClass("tree-unfold");
								node.find(">ul").show();
							}
						}else{
							//如果可以选择重复节点
							if(setting.duplicate){
								_select(node.data('value'), node.data('text'));
							}else{//如果不可以选择重复节点
								var selecteds = _getSelectedValue();
								if($.inArray(node.data('value'), selecteds) == -1){
									_select(node.data('value'), node.data('text'));
									node.hide();
									node.attr('disabled', 'disabled');
								}
							}
						}
					}
				}else{//单选
					if(self.data('selected-finish')){
						return;
					}
					//如果可以选择父节点
					if(setting.selectParent){
						_select(node.data('value'), node.data('text'));
						self.data('selected-finish', true);
						self.find('.select-option').attr('disabled', 'disabled');
					}else{//如果不能选择父节点，单击项目并且有子节点的仅仅是展开或折叠
						if(node.find("ul>li .select-item").length > 0){
							if(node.hasClass("tree-unfold")) {//如果已展开，就折叠
								node.removeClass("tree-unfold");
								node.find(">ul").hide();
							} else {//如果处于折叠，就展开
								node.addClass("tree-unfold");
								node.find(">ul").show();
							}
						}else{
							_select(node.data('value'), node.data('text'));
							self.data('selected-finish', true);
							self.find('.select-option').attr('disabled', 'disabled');
						}
					}
				}
			});
		}
		/**
		 * 选择选项的处理
		 * @param {Object} value
		 * @param {Object} text
		 */
		function _select(value, text){
			_hiddenPlaceholder();
			$('<li class="selected-item" data-value="' + value + '" data-text="' + text + '"><span>' + text + '</span><i class="selected-icon select-icon select-icon-close"></i></li>').appendTo(self.find(".selected-items"));
			//注册选中项单击的事件
			$("#"+ id +"__selected-items").on("click", ".selected-icon", function(e) {
				e.stopPropagation(); //阻止事件冒泡
				var selectedOption = $(this).parent(".selected-item");
				if(setting.multiple){//如果是多选，则查找选择的备选项进行显示和移出禁用
					var hiddenSelectItem = $("#"+ id +"__items-box .select-option[data-value="+selectedOption.data('value')+"]:hidden");
					if(hiddenSelectItem.length > 0){
						hiddenSelectItem.removeAttr('disabled');
						hiddenSelectItem.show();
					}
				}else{//如果是单选，则移出所有选项的禁用状态，并且显示
					selectItems = $("#"+ id +"__items-box .select-option");
					selectItems.removeAttr('disabled');
					selectItems.show();
					self.data('selected-finish', false);
				}
				selectedOption.remove();
				if(self.find('.selected-item').length > 0){
					_hiddenPlaceholder();
				}else{
					_showPlaceholder();
				}
			});
		}
		function _showPlaceholder(){
			if(setting.placeholder && $("#"+ id +"__selected-items>.placeholder").length == 0){
				$('<li class="placeholder">' + setting.placeholder + '</li>').appendTo($("#"+ id +"__selected-items"));
			}
		}
		
		function _hiddenPlaceholder(){
			if(setting.placeholder){
				$("#"+ id +"__selected-items>.placeholder").remove();
			}
		}
		/**
		 * 渲染UI界面
		 * @param {Object} data 数据
		 */
		function _renderUI(data){
			//JSON数据存在nodes节点，且存在至少一个结果进行渲染
			return _renderNodes(data.nodes, 0);
		}
		
		/**
		 * 渲染节点数据
		 * @param {Object} nodes 节点数据
		 * @param {Object} deep 深度
		 */
		function _renderNodes(nodes, deep){
			var root = $('<ul class="tree" style="' + (deep != 0 ? 'padding-left: 16px;display: none;' : '') + '"></ul>');
			for(var index in nodes) {
				var node = nodes[index];
				var element = _renderNode(node);
				//存在子节点
				if(node.nodes) {
					element.append('<i class="unfold-icon select-icon select-icon-enter"></i>');
					var tree = _renderNodes(node.nodes, ++deep);
					tree.appendTo(element);
				}
				element.appendTo(root);
			}
			return root;
		}
		/**
		 * 渲染节点
		 * @param {Object} node 节点数据
		 */
		function _renderNode(node){
			var icon = node.icon ? node.icon : '';
			var value = node.value;
			var text = node.text;
			var selected = node.selected;
			var disabled = false;
			if(setting.multiple){//如果是多选
				for(var idx in selectedValues){
				var selectedValue = selectedValues[idx];
					if(selectedValue == value){
						selected = true;
						disabled = true;
					}
				}
			}else{//如果是单选
				if(self.data('selected-finish')){
					disabled = true;
				}
			}
			var element = $('<li class="select-option" data-icon="' + icon + '" data-value="' + value + '" data-text="' + text + '" '+ (disabled ? 'disabled="disabled" ': '') + (selected ? 'style="display:none;"' : '') +'><i class="item-icon select-icon ' + icon + '"></i><span  class="select-item">' + text + '</span></li>');
			if(node.selected){
				_select(value, text);
			}
			return element;
		}
		
		/**
		 * 本地搜索
		 * @param {Object} keyword 关键词
		 */
		function _localSearch(keyword){
			var matchCount = 0;
			$("#"+ id +"__items-box").find(".select-option").each(function(index, ele){
				var option = $(ele);
				var item = option.find(".select-item");
				var text = option.data('text');
				var value = option.data('value');
				var pos = text.indexOf(keyword);
				//如果关键词没有，则全部恢复
				if(!keyword || keyword.length == 0){
					item.html(text);
					if(!option.attr('disabled')){
						option.show();
						option.parents('.select-option').show();
					}
					matchCount++;
					return;
				}
				if(pos>-1){
					item.html(text.slice(0,pos)
						+ '<span class="search-result">'
						+ keyword
						+ '</span>'
						+ text.slice(pos + keyword.length)
					);
					if(!option.attr('disabled')){
						option.show();
						option.parents('.select-option').show();
					}
					matchCount++;
				}else{
					option.hide();
				}
			});
			//没有匹配的结果，显示提示信息
			if(matchCount == 0){
				showMessage('无匹配的选项！');
			}else{
				var remindBox = $("#"+ id +"__select-remind-box");
				remindBox.html('');
				remindBox.hide();
			}
		};
		/**
		 * 远程搜索
		 * @param {Object} keyword 关键字
		 */
		function _remoteSearch(keyword, _pageNo){
			if(!funcDataSource){
				funcShowMessage('未提供数据源函数!');
				return;
			}
			if(!_pageNo){
				_pageNo = pageNo;
			}
			var data = funcDataSource(instance, keyword, pageSize, _pageNo);
			//发送获取远程数据源
			_setDataSource(data);
		}
		/**
		 * 绘制组件
		 */
		function _draw(){
			var _this = this;
			self.empty();
			var id = self.attr('id');
			var placeholder = (setting.placeholder ? '<li class="placeholder">'+ setting.placeholder +'</li>' : '');
			var pagination = '<!--分页区-->'
							+'<div class="select-pagination" id="'+ id +'__pagination">'
								+'<i class="select-pagination-button select-icon select-icon-skip-previous"></i>'
								+'<i class="select-pagination-button select-icon select-icon-chevron-left"></i>'
								+'<span class="select-pagination-text" id="'+ id +'__pagination-pageNo">0</span><span class="select-pagination-text">/</span><span class="select-pagination-text"  id="'+ id +'__pagination-pageNum">0</span>'
								+'<i class="select-pagination-button select-icon select-icon-chevron-right"></i>'
								+'<i class="select-pagination-button select-icon select-icon-skip-next"></i>'
							+'</div>';
			self.append('<div class="selected-bar">'
							+'<ul class="selected-items" id="'+ id +'__selected-items">'
							+ placeholder
							+'</ul>'
							+'<span class="refresh-btn select-icon select-icon-refresh" id="'+ id +'__refresh-btn"></span>'
						+'</div>'
						+'<div class="dropdown-items" id="'+ id +'__dropdown_items" style="width: calc('+ self.width() +'px - 2px); display: none;">'
							+'<div class="search-bar">'
								+'<input class="search-input" id="'+ id +'__select-input" placeholder="'+ (setting.mode == 'local' ? setting.local.searchPlaceholder:setting.remote.searchPlaceholder) +'">'
								+'<span class="search-btn select-icon select-icon-search" id="'+ id +'__search-btn"></span>'
							+'</div>'
							+'<div class="items-box" id="'+ id +'__items-box">'
							+'</div>'
							+ (setting.mode == 'remote' ? pagination : '')
							+'<!--信息提示区-->'
							+'<div class="select-remind-box" id="'+ id +'__select-remind-box" style="display: none;">'
							+'	无匹配的选项！'
							+'</div>'
						+'</div>');
			$('body').on("click", "#" + id + " .selected-bar", function(e) {
				self.find(".dropdown-items").toggle();
			});

			//注册鼠标在组件外单击，隐藏组件下拉框
			$(document).on("click", function(e){
				//检查当前触发事件的对象与当前的组件div是否属于包含关系
				if(self.is(e.target) || self.has(e.target).length > 0){
					return;
				}
				self.find(".dropdown-items").hide();
				self.find("#"+ id + "__select-input").val('');
				//阻止事件冒泡
				e.stopPropagation();
			});
			//注册单击搜索按钮，触发数据源函数
			$('body').on("click", "#"+ id + " .search-btn", function(e){
				var keyword = $("#"+ id + "__select-input").val();
				if(setting.mode == 'local'){
					_localSearch(keyword);	
				}else{
					_remoteSearch(keyword);
				}
			});
			//注册搜索框按回车，触发数据源函数
			$('body').on("keyup", "#"+ id + "__select-input", function(e){
				//如果不是回车，则不进行事件处理
				if(setting.enterSearch){
					if(13 != event.keyCode){
						return;
					}
				}
				e.stopPropagation(); //阻止事件冒泡
				var target = $(e.target);
				var keyword = target.val();
				if(setting.mode == 'local'){
					_localSearch(keyword);	
				}else{
					_remoteSearch(keyword);
				}
			});
			
			$("#"+ id +"__refresh-btn").click(function(e){
				e.stopPropagation(); //阻止事件冒泡
				$("#"+ id +"__dropdown_items").hide();
				var remindBox = $("#"+ id +"__select-remind-box");
				_cleanSelecteds();
				remindBox.html('');
				remindBox.hide();
				if(setting.mode != 'local'){
					_setDataSource({});
				}
			});
			//如果是远程模式则注册事件
			if(setting.mode == 'remote'){
				$("#"+ id +"__pagination .select-icon-chevron-left").click(function(e){
					e.stopPropagation(); //阻止事件冒泡
					var keyword = $("#"+ id + "__select-input").val();
					_remoteSearch(keyword, _getPrePageNo());
				});
				
				$("#"+ id +"__pagination .select-icon-skip-previous").click(function(e){
					e.stopPropagation(); //阻止事件冒泡
					var keyword = $("#"+ id + "__select-input").val();
					_remoteSearch(keyword, 1);
				});
				
				$("#"+ id +"__pagination .select-icon-chevron-right").click(function(e){
					e.stopPropagation(); //阻止事件冒泡
					var keyword = $("#"+ id + "__select-input").val();
					_remoteSearch(keyword, _getNextPageNo());
				});
				
				$("#"+ id +"__pagination .select-icon-skip-next").click(function(e){
					e.stopPropagation(); //阻止事件冒泡
					var keyword = $("#"+ id + "__select-input").val();
					_remoteSearch(keyword, _getLastPageNo());
				});
			}
		}
		
		function _getLastPageNo(){
			var _pageNo = 1;
			if(total == 0){
				_pageNo = 1;
			}else if(Math.floor((total - 1) / pageSize + 1) > pageNo){
				_pageNo = Math.floor((total - 1) / pageSize + 1);
			}
			return _pageNo;
		}
		
		function _getPrePageNo(){
			var _pageNo = Math.max(pageNo > 0 ? pageNo -1: 1, 1);
			return _pageNo;
		}
		
		function _getNextPageNo(){
			var _pageNo = Math.min(pageNo + 1, _getLastPageNo());
			return _pageNo;
		}
		
		function _setPageNum(_pageNum){
			$("#"+ id +"__pagination-pageNum").html(_pageNum);
		}
		
		function _getPageNo(){
			var _lastPageNo = _getLastPageNo();
			if(pageNo< _lastPageNo){
				return pageNo;
			}else{
				return _lastPageNo;
			}
		}
		
		function _setPageNo(_pageNo){
			$("#"+ id +"__pagination-pageNo").html(_pageNo);
			pageNo = _pageNo;
		}
		
		function _setDataSource(data, totle){
			if(typeof(data) == 'string') {
				data = JSON.parse(data);
			}
			selectedValues =  _getSelectedValue();
			_cleanOptions();
			if(data.total){
				total = data.total;
			}
			if(data.pageSize){
				pageSize = data.pageSize;
			}
			if(data.pageNo){
				_setPageNo(data.pageNo);
			}
			if(data.pageNum){
				_setPageNum(data.pageNum)
			}
			if(data.nodes && data.nodes.length > 0){
				var dom = _renderUI(data);
				dom.appendTo($("#"+ id +"__items-box"));
				var ops = _doOptions(data.nodes, null);
				self.data("dataSource", data);
				self.data("options", JSON.stringify(ops));
			}else{
				self.data("dataSource", data);
				self.data("options", JSON.stringify([]));
			}
			_bindEvent();
		}
		
		function _getDataSource(){
			var json = self.data("dataSource");
			if(typeof(json) == 'string') {
				json = JSON.parse(json);
			}
			return json;
		}
		
		function _setSelectedValue(data){
			if(typeof(data) == 'string') {
				data = JSON.parse(data);
			}
			var selects = [];
			for (var index in data) {
				var value = data[index];
				if($.inArray(value, selects)==-1){//不允许重复
					selects.push(value);//没有重复的时候，直接加入
				}else{
					if(setting.duplicate){//如果允许重复
						selects.push(value);
					}
				}
			}
			var options = this.getOptions();
			for (var i = 0; i < options.length; i++) {
				var option = options[i]
				//检查选线是否在需要设置的选项值
				if($.inArray(option['value'], selects)> -1){
					if(setting.duplicate){//如果允许重复，则需要按照选中值进行遍历
						for(var index in selects){
							if(option['value'] == selects[index]){
								this.select(option['value'], option['text']);
							}
						}
					}else{
						this.select(option['value'], option['text']);
					}
				}
			}
			self.data("selected-value", data);
		}
		/**
		 * 获取已选择的编码值数组
		 */
		function _getSelectedValue(){
			var values = [];
			self.find(".selected-item").each(function(index, item) {
				values.push($(item).data("value"));
			});
			return values;
		}
		/**
		 * 获取已选择的文字数组
		 */
		function _getSelectedText(){
			var selectedText = [];
			self.find(".selected-item").each(function(index, item) {
				selectedText.push($(item).data("text"));
			});
			return selectedText;
		}
		
		/**
		 * 清空备选选项
		 */
		function _cleanOptions(){
			$("#"+ id +"__items-box").empty();
			self.data("dataSource", '{}');
		}
		/**
		 * 清空已选选项
		 */
		function _cleanSelecteds(){
			self.find(".selected-icon").each(function(index, item) {
				var selectedOption = $(item).parent(".selected-item");
				var hiddenSelectItem = $("#"+ id +"__items-box .select-option[data-value="+selectedOption.data('value')+"]:hidden");
				if(hiddenSelectItem.length > 0){
					hiddenSelectItem.removeAttr('disabled');
					hiddenSelectItem.show();
				}
				selectedOption.remove();
			});
		}
		
		/**
		 * 处理数据源中的节点数据为选项数组
		 * @param {Object} nodes 数据源节点
		 * @param {Object} options 选项数组
		 */
		function _doOptions(nodes, options) {
			if(!options) {
				options = [];
			}
			for(var index in nodes) {
				var node = nodes[index];
				var option = {};
				option['value'] = node.value;
				option['text'] = node.text;
				options.push(option);
				if(node.nodes) {
					_doOptions(node.nodes, options);
				}
			}
			return options;
		}
		
		function _getOptions(){
			var json = self.data("options");
			if(typeof(json) == 'string') {
				json = JSON.parse(json);
			}
			return json;
		}
		
		Select.prototype = {
			constructor: Select,
			/**
			 * 绑定事件
			 */
			bindEvent: function() {
				return _bindEvent();
			},
			/**
			 * 选中给定代码值和文本的选项
			 * @param {Object} value 代码值
			 * @param {Object} text 文本
			 */
			select: function(value, text){
				return _select(value, text);
			},
			/**
			 * 渲染数据为UI
			 * @param {Object} data
			 */
			renderUI: function(data){
				return _renderUI(data);
			},
			/**
			 * 绘制组件
			 */
			draw: function(){
				return _draw();
			},
			/**
			 * 在一个给定的组件ID以JSON对象设置数据源
			 * @param {Object} data 形如{nodes:[{text:'测试项1', value:123},{text:'测试项2', value:456}], pageSize:20, pageNo:1, total:20}
			 */
			setDataSource: function(data) {
				return _setDataSource(data);
			},
			/**
			 * 获取数据源，返回得是一个JSON对象
			 */
			getDataSource: function() {
				return _getDataSource();
			},
			/**
			 * 在一个给定的组件ID设置选中的值，设置值可为整数，字符串，整数数组或字符串数组
			 * @param {Object} value 选中的编码值，例如123
			 */
			setSelectedValue: function(data) {
				return _setSelectedValue(data);
			},
			/**
			 * 在一个给定的组件ID获取选中的值，返回结果为选中的编码值数组
			 */
			getSelectedValue: function() {
				return _getSelectedValue();
			},
			/**
			 * 在一个给定的组件ID获取选中的展示值，返回结果为选中的展示值数组
			 */
			getSelectedText: function() {
				return _getSelectedText();
			},
			/**
			 * 获取选项
			 */
			getOptions: function() {
				return _getOptions();
			}
		};
		
		var instance = new Select(_funcShowMessage,
							   _funcDataSource,
							   _funcClick,
							   _funcHover,
							   _funcMouseOut,
							   _setting);
		//绘制组件
		instance.draw();
		return instance;
	};
})(jQuery, window);
