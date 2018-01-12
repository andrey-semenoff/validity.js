/*
** Jquery plugin for validate forms
** Created by Andrey Semenoff
** GNU lisence
*/
(function($){
	$.fn.extend({
		validity: function(options) {
			var $forms = $(this), 
					defaults = {
						ajax: false,
						action: 'mail.php',
						method: 'POST',
						dataType: 'json',
						cache: false,
						elements: 'input:not([type=hidden],[type=image],[type=reset],[type=submit],[type=button],[type=file]), textarea, select',
						exclude: 'input[type=radio], input[type=checkbox]',
						position: 'static|bottom/left',
						errorClass: 'error',
						inputStyle: 'validity-input',
						tooltip: 'validity-tooltip_top',
						tooltipPos: 'bottom[100%]/left[0]',
						language: null,
						show_names: true
					},
					messages = {
						required: 'Поле %name не должно быть пустым',
						email: 'Введите email в правильном формате (xxxxxx@xxx.xxx)',
						tel: 'Введите телефон в правильном формате (0123456789)',
						length_min: 'Минимальная длина поля %name - %x символов',
						length_max: 'Максимальная длина поля %name - %x символов',
						lengthNotOptional: 'Поле %name неверно настроено',
						min: 'Значение поля %name не можеть быть меньше %x',
						max: 'Значение поля %name не можеть быть больше %x',
						maxlength: 'Максимальная длина поля %name - %x символов',
						pattern: 'Поле %name заполнено неверно',
						number: 'Значение поля %name должно быть числом',
					},
					rules = {
						'required': function(val) {
							if( val !== '' ) return {status: true};
							else return {status: false, msg: messages.required};
						},
						'email': function(val) {
							var regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				    	if( regexp.test(val) ) return {status: true};
				    	else return {status: false, msg: messages.email}
						},
						'tel': function(val) {
							var regexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
				    	if( regexp.test(val) ) return {status: true};
				    	else return {status: false, msg: messages.tel}
						},
						'length': function(val, params) {
							if( params.length ) {
								let min = params[0];
								if( params.length > 1 ) {
									let max = params[1];
									if( val.length > max ) return {status: false, msg: messages.length_max.replace('%x', max)};
								}
								
								if( val.length < min ) return {status: false, msg: messages.length_min.replace('%x', min)};
								
								return {status: true};
							} else return {status: false, msg: messages.lengthNotOptional};
						},
						'min': function(val, min) {
							val = parseInt(val);
							min = parseInt(min);
							if( Number.isInteger(val) && val >= min ) return {status: true};
							else return {status: false, msg: messages.min.replace('%x', min)};
						},
						'max': function(val, max) {
							val = parseInt(val);
							max = parseInt(max);
							if( Number.isInteger(val) && val <= max ) return {status: true};
							else return {status: false, msg: messages.max.replace('%x', max)};
						},
						'maxlength': function(val, num) {
							if( val.length < num ) return {status: true};
							else return {status: false, msg: messages.maxlength.replace('%x', num)};
						},
						'pattern': function(val, regexp) {
				    	if( regexp.test(val) ) return {status: true};
				    	else return {status: false, msg: messages.pattern}
						}
					};

			init(options);

			function init(options) {
				$.extend(defaults, options);

				if( defaults.language ) {
					messages = $['validityLanguage_' + defaults.language]();
				}

				if( defaults.rules ) {
					$.extend(rules, defaults.rules);
				}

				readForms();
			}

			function readForms() {
				$forms.each(function() {
					let $form = $(this),
							fieldset = [];

					$form.find(defaults.elements).not(defaults.exclude).each(function() {
						let $this = $(this),
								name = $this.attr('name'),
								attributes = $this[0].attributes;

						fieldset[name] = [];
						fieldset[name]['tagName'] = $this[0].tagName.toLowerCase();
						fieldset[name]['type'] = $this[0].type;
						
						let rules = '';
						if( $this.data('rules') ) {
							rules = $this.data('rules').split('|');
							rules.forEach(function(item, i) { rules[i] = item.replace(/\s/g, "") })
						}
						fieldset[name]['rules'] = rules;

						let attr = ['required', 'maxlength', 'pattern', 'min', 'max'];
						fieldset[name]['attr'] = [];
						attr.forEach(function(item) {
							if( item in attributes ) {
								fieldset[name]['attr'][item] = $this.prop(item);
							}
						})
					});

					$form.attr('novalidate', true);

					$form.submit(function(e) {
								e.preventDefault();

						if( validate(this, fieldset) ) {
							configure_form($form);

							if( defaults.ajax ) {
								
								let formData = $form.serialize();
								console.log('ajax');
								console.log(formData);

								// $.ajax({
								// 	url: defaults.action,
								// 	data: defaults.formData,
								// 	method: defaults.method,
								// 	dataType: defaults.dataType,
								// 	cache: defaults.cache,
								// 	success: function(data) {
								// 		console.log('success');
								// 		console.log(data);
								// 	},
								// 	error: function(data) {
								// 		console.log('error');
								// 		console.log(data);
								// 	},
								// });

							} else {
								console.log('reload');
								// $form.unbind('submit').submit();
							}
						} else {
							console.warn('Validation failed!');
						}
					});
				});
			}

			function validate(form, fieldset) {
	// console.log(fieldset);
				let $form = $(form),
						isValid = true;

				$form.find('.validity-note').remove();
				$form.find('.'+defaults.inputStyle + '_' + defaults.errorClass).removeClass(defaults.inputStyle + '_' + defaults.errorClass);

				for( name in fieldset ) {
					let $field = $form.find('[name='+ name +']'),
							show_name = '',
							field_value = $field.val().trim(),
							testValidб
							errorMsg = '';

					$field.val(field_value);

					if( defaults.show_names && $field.data('fieldname') ) show_name = '"' + $field.data('fieldname') + '" ';

					// validate by rules
					if( fieldset[name].rules.length > 0 ) {
						if( field_value.length == 0 && fieldset[name].rules.indexOf('required') == -1 ) {
							testValid = {status: true};
						} else {
							fieldset[name].rules.forEach(function(rule) {
								let rule_params = rule.match(/\([^\)]*\)/);
								rule = rule.replace(/\(.*\)/, '');

								if( rule_params !== null ) {
									rule_params = rule_params[0].replace(/[\(\)]/g, '');
									testValid = rules[rule](field_value, rule_params.split(','));
								} else {
									testValid = rules[rule](field_value);
								}

								if( !testValid.status && errorMsg == '' ) errorMsg = testValid.msg.replace(/%name\W/, show_name);
							});
						}

					// validate by attributes
					} else if( Object.keys(fieldset[name].attr).length > 0 ) {
						if( field_value.length == 0 && !fieldset[name].attr.hasOwnProperty('required') ) {
							testValid = {status: true};
						} else {
							for( attr in fieldset[name].attr ) {
								testValid = rules[attr](field_value, fieldset[name].attr[attr]);

								if( !testValid.status && errorMsg == '' ) errorMsg = testValid.msg.replace(/%name\W/, show_name);
							}
						}
					} else {
						testValid = {status: true};
					}

					if( errorMsg !== '' ) show_errorMsg($field, errorMsg);

					if ( isValid ) isValid = testValid.status;
				}

				return isValid;
			}

			function configure_form($form) {
				if( !$form.attr('method') || $form.attr('method') == '' ) {
					$form.attr('method', defaults.method);
				}
				if( !$form.attr('action') || $form.attr('action') == '' ) {
					$form.attr('action', defaults.action);
				}
			}

			function show_errorMsg($field, errorMsg) {
				let position = defaults.position.split('|');

				if( defaults.inputStyle ) $field.addClass(defaults.inputStyle + '_' + defaults.errorClass);

				$field.keypress(function() {
					$field.removeClass(defaults.inputStyle + '_' + defaults.errorClass);
					$field.parent().find('.validity-note').remove();
				});

				if( position[0] == 'static' ) {
					$field.after("<div class='"+ defaults.errorClass +"'>"+ errorMsg +"</div>");
				} else {
					let $parent = $field.parent(),
							style = 'position:' + position[0] +';',
							tooltip = '';

					positions = position[1].split('/');

					positions.forEach(function(pos) {
						let pos_name, pos_param; 

						if( /\[.*\]/.test(pos) ) {
							pos_name = pos.replace(/\[.*\]/, '');
							pos_param = pos.match(/\[.*\]/)[0].replace(/[\[\]]/g, '');
						} else {
							pos_name = pos;
							pos_param = 0;
						}
						style += pos_name + ': '+ pos_param +';';
					});

					if( defaults.tooltip && position[0] == 'absolute' ) {
						let tooltip_style = 'position: absolute;';

						defaults.tooltipPos.split('/').forEach(function(pos) {
							let pos_name, pos_param;
							if( /\[.*\]/.test(pos) ) {
								tooltip_pos_name = pos.replace(/\[.*\]/, '');
								tooltip_pos_param = pos.match(/\[.*\]/)[0].replace(/[\[\]]/g, '');
							} else {
								tooltip_pos_name = pos;
								tooltip_pos_param = '100%';
							}

							tooltip_style += tooltip_pos_name + ': '+ tooltip_pos_param +';';
						});

						tooltip = "<div class='"+ defaults.tooltip +"' style='"+ tooltip_style +"'></div>";
					}

					$parent.css('position', 'relative');
					$parent.append("<div class='validity-note validity-note_"+ defaults.errorClass +"' style='"+ style +"'>"+ errorMsg + tooltip +"</div>")
				}

				// console.error(errorMsg);
			}

			return this.init;
		}
	});
})(jQuery);