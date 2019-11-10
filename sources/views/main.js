import {JetView} from "webix-jet";
import {data, cars} from "models/records";



export default class TopView extends JetView{
	adjustHeaderHeight(self){
		var columns = self.config.columns;
		var column = columns[0];
		var header = column.header[0];

		//create a temp div
		var d = webix.html.create("DIV",{"class":"webix_measure_size "+header.css},"");
		d.style.cssText = "width:"+column.width+"px; height:auto; visibility:hidden; position:absolute; top:0px; left:0px; overflow:hidden;";
		d.innerHTML = header.text;
		self.$view.appendChild(d);

		//get the necessary height
		header.height = d.scrollHeight;
		//remove the temp div
		webix.html.remove(d);

		//apply new height
		self.refreshColumns();
	}
	config(){
		function calendar(event, column, target, self){
			console.log(self.getItem(column.row));
			let currentItem = self.getItem(column.row);
			let calendarView = webix.ui({
				view: "window",
				id: "calendarModal",
				head: "Выберите дату",
				width: 400,
				// height: 400,
				// close: true,
				modal: true,
				position: "center",
				body: {
					rows: [
						{
							weekHeader: true,
							weekNumber: true,
							date: new Date(Date.now()),
							view: "calendar",
							multiselect:true,
							events: webix.Date.isHoliday,
							blockDates:function(date){
								let yesterday = new Date(Date.now()).setDate(new Date(Date.now()).getDate() - 1);
								console.log(date);
								let isBusy = currentItem.isBusy.find(function (item) {
									return new Date(item).getFullYear()==date.getFullYear() && new Date(item).getMonth()==date.getMonth() && new Date(item).getDate()==date.getDate();
								});
								if(yesterday>date || isBusy){
									return true;
								}
		}
							// minDate:'2018-04-05',
							// maxDate:new Date(2018, 4, 20),

						},
						{
							cols: [
								{view: "button", css: "webix_primary", label: "Выбрать"},
								{view: "button", css: "webix_danger", label: "Отменить", click: ()=>{
									$$("calendarModal").close();
									}

									}
							]
						}
					]
				}

			}).show();
		}
		let statusOption = [
			{id: 1, value: "подтверждено"},
			{id: 2, value: "согласование"},
		];
		let addBookModal = webix.ui({
					view: "window",
					id: "addBookModal",
					head: "Добавить бронь",
					width: 400,
					// height: 400,
					close: true,
					modal: true,
					position: "center",
					body: {
						view: "form",
						id: "addBookForm",
						rows: [
							{id: "car", view: "text", label:"Машина", labelWidth: 120, name: "car"},
							{id: "number", view: "text", label:"Номер", labelWidth: 120, name: "number"},
							{id: "name", view: "text", label:"Имя", labelWidth: 120, name: "name"},
							{id: "phone", view: "text", label:"Телефон", labelWidth: 120, name: "phone"},
							{id: "email", view: "text", label:"Email", labelWidth: 120, name: "email"},
							{id: "date_start", view: "text", label:"Дата подачи", labelWidth: 120, name: "date_start"},
							{id: "place_start", view: "text", label:"Место подачи", labelWidth: 120, name: "place_start"},
							{id: "date_end", view: "text", label:"Дата забора", labelWidth: 120, name: "date_end"},
							{id: "place_end", view: "text", label:"Место забора", labelWidth: 120, name: "place_end"},
							{id: "price_rent", view: "text", label:"Цена (аренда)", labelWidth: 120, name: "price_rent"},
							{id: "price_ins", view: "text", label:"Цена (страховка)", labelWidth: 120, name: "price_ins"},
							{id: "price_del", view: "text", label:"Цена (доставка)", labelWidth: 120, name: "price_del"},
							{id: "price_vat", view: "text", label:"Налог", labelWidth: 120, name: "price_vat"},
							{id: "price_total", view: "text", label:"Цена (итого)", labelWidth: 120, name: "price_total"},
							{id: "status", view: "select", label: "Статус", labelWidth: 120, options:statusOption, name: "status"},
							{id: "comment", view: "textarea", label: "Комментарий", labelWidth: 120, name: "comment"},
							{id: "addBookBtn", label: "Добавить", view: "button", css: "webix_primary", click: ()=> {
							console.log($$("addBookForm").getValues());
							let formValues = $$("addBookForm").getValues();
							console.log($$("booking"));
							$$("booking").add(formValues, 0);
									$$("addBookForm").clear();
									$$("addBookModal").hide();
								}
							}
						],
					}
				});
		var ui = {
			type:"clean", paddingX:5, css:"app_layout", cols:[
				{
					view: "tabview",
					// minHeight: 600,
					tabbar: {
						optionWidth: 150,
					},
					cells: [
						{
							header: "Бронь",
							body:{
								rows: [
									{
										id: "booking",
										view: "datatable",
										yCount:50,
										editable: true,
										scroll:false,
										navigation:true,
										pager:"pager",
										math: true,
										fixedRowHeight:false,
										rowLineHeight:25,
										rowHeight:25,
										onClick:{
											"addBook" : function  (event, column, target) {
												addBookModal.show();
												webix.message("Click on header");
											},
											"wxi-trash":function(event, id, node){
												this.remove(id);
											}
										},
										on:{
											onAfterLoad:function(){
												webix.delay(function(){
													this.adjustRowHeight("date_end", true);
													this.render();
												}, this);
											},
											onColumnResize:function(){
												this.adjustRowHeight("date_end", true);
												this.render();
											}
										},
										data: data,
										scheme: {
											$init: function (item) {
												// let format = webix.Date.dateToStr("%d.%m.%Y %H:%i");
												item.date_start = new Date(+item.date_start);
												// item.date_start = format(new Date(+item.date_start));
												// item.date_end = format(new Date(+item.date_end));
												item.date_end = new Date(+item.date_end);
												switch (item.status) {
													case '1':  // if (x === 'value1')
														item.$css = "status-confirm";
														break;
												}
											}
										},
										columns: [
											{id: "car", editor: "text", header: ["Машина", { content:"textFilter" }]},
											{id: "number", editor: "text", header: ["Номер", { content:"textFilter" }]},
											{id: "name", editor: "text", header: "Имя", fillspace: true},
											{id: "phone", editor: "text", header: "Телефон", width:120},
											{id: "email", editor: "text", header: "Email", width:120},
											{id: "date_start",  editor: "date", header: ["Дата подачи", {content:"dateFilter"}], width: 100, format:webix.i18n.fullDateFormatStr},
											{id: "place_start", editor: "text", header: "Место подачи", width: 140},
											{id: "date_end", editor: "date", header: ["Дата забора", { css: "multiline", height:40, content:"dateFilter"}],  width: 100, format:webix.i18n.fullDateFormatStr},
											{id: "place_end", editor: "text", header: "Место забора", width: 140},
											{id: "price_rent", editor: "text", header: {text: "Цена <br>(аренда)", css: "multiline", height:40}, width: 80},
											{id: "price_ins", editor: "text", header: {text: "Цена <br>(страховка)", css: "multiline", height:40}, width: 80},
											{id: "price_del", editor: "text", header: {text: "Цена <br>(доставка)", css: "multiline", height:40}, width: 80},
											{id: "price_vat", editor: "text", header: "Налог", width: 80},
											{id: "price_total", editor: "text", header:{text: "Цена <br>(итого)", css: "multiline", height:40}, width: 80, math:"[$r,price_rent] + [$r,price_ins]+[$r,price_del]+[$r,price_vat]"},
											{id: "status", header: "Статус", editor: "select", options:statusOption},
											{id: "comment", editor: "text", header:"Коммнтарий"},
											{id: "delete", header: {text:"<div class='webix_primary'><button class='webix_button addBook'>+</button></div>", css:"header-button"}, template:"{common.trashIcon()}", width: 40},
										]
									},
									{
										view:"pager",
										id:"pager",
										size:25,
									}
								]
							}


						},
						{
							header: "Машины",
							body:{
										id: "cars",
										view: "datatable",
										yCount:10,
										width: 300,
										scroll: false,
										onClick:{
											"addBook" : function  (event, column, target) {
												addBookModal.show();
											},
											"wxi-calendar" : function  (event, column, target) {
												console.log(this);
												calendar(event, column, target, this);
											},
										},
										data: cars,
										// scheme: {
										// 	$init: function (item) {
										// 		// let format = webix.Date.dateToStr("%d.%m.%Y %H:%i");
										// 		item.date_start = new Date(+item.date_start);
										// 		// item.date_start = format(new Date(+item.date_start));
										// 		// item.date_end = format(new Date(+item.date_end));
										// 		item.date_end = new Date(+item.date_end);
										// 		switch (item.status) {
										// 			case '1':  // if (x === 'value1')
										// 				item.$css = "status-confirm";
										// 				break;
										// 		}
										// 	}
										// },
										columns: [
											{id: "car", header: ["Машина", { content:"textFilter" }], fillspace: true},
											{id: "number", header: ["Номер", { content:"textFilter" }], fillspace: true},
											{id: "calendar",  header: {text:"<div class='webix_primary'><button class='webix_button addBook'>+</button></div>", css:"header-button"}, template:"<span class='webix_icon wxi-calendar'></span>", width: 40, css: {"text-align": "center"}},
										]
							}
						}
					]
				}
			]
		};

		return ui;
	}
}