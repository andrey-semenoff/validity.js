/*! Validity.js v.1.0.0
** Jquery plugin for validate forms
** (c) Andrey Semenoff (andrey.semenoff@gmail.com)
** Free lisence
*/
(function($){
	$.fn.extend({
		validity: function(options) {
			var $forms = $(this), 
					defaults = {
						debug: false,
						ajax: false,
						action: '/',
						method: 'POST',
						dataType: 'json',
						cache: false,
						elements: 'input:not([type=hidden],[type=image],[type=reset],[type=submit],[type=button],[type=file]), textarea, select',
						exclude: 'input[type=radio], input[type=checkbox]',
						position: 'static|bottom/left',
						errorClass: 'error',
						successClass: 'success',
						inputStyle: 'validity-input',
						inputSuccess: {
							styling: false,
							showMsg: false,
							msg: "&#10003;",
							tooltip: false
						},
						inputError: {
							styling: true,
							showMsg: true,
							tooltip: true
						},
						tooltip: 'validity-tooltip_top',
						tooltipPos: 'bottom[100%]/left[0]',
						language: null,
						show_names: true,
						detectIntervention: true,
						focusInvalid: true,
						onValidationOk: function(e, $form) {

							configure_form($form);

							if( defaults.ajax ) {
								e.preventDefault();
								
								var formData = $form.serialize();
								if(defaults.debug) console.log('ajax');
								if(defaults.debug) console.log(formData);

								$form.find('button, input[type="submit"]').attr('disabled', true);

								$.ajax({
									type: defaults.method,
									url: defaults.action,
									data: formData,
									method: defaults.method,
									dataType: defaults.dataType,
									cache: defaults.cache,
									success: function(data) {
										defaults.onAjaxOk(data, $form);
									},
									error: function(data) {
										if(defaults.debug) console.log('error');
										if(defaults.debug) console.log(data);
									}
								}).always(function () {

								});

							} else {
								console.log('reload');
								// $form.unbind('submit').submit();
							}
						},
						onValidationError: function($form, message, status) {
							if( !$('.msgBox').length ) showFormMsg($form, message, status);
						},
						onAjaxOk: function (data, $form) {
							if(defaults.debug) console.log('ajaxOk');
							if(defaults.debug) console.log(data);
						}
					},
					messages = {
						required: 'Поле %name не должно быть пустым',
						email: 'Введите email в правильном формате (xxxxxx@xxx.xxx)',
						tel: 'Введите телефон в правильном формате (0123456789)',
						length_min: 'Минимальная длина поля %name - %x символов',
						length_max: 'Максимальная длина поля %name - %x символов',
						lengthNotOptional: 'Поле %name неверно настроено',
						min: 'Значение поля %name должно быть числом >= %x',
						max: 'Значение поля %name должно быть числом <= %x',
						maxlength: 'Максимальная длина поля %name - %x символов',
						pattern: 'Поле %name заполнено неверно',
						number: 'Значение поля %name должно быть числом',
						form_send_ok: 'Данные успешно отправлены!',
						form_send_error: 'Данные не удалось отправить!',
						detect_intervention: 'Обраружено вмешательство в код формы!',
						validation_error: 'Обнаружены ошибки при заполнении полей формы!'
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
								var min = params[0];
								if( params.length > 1 ) {
									var max = params[1];
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
						},
						'number': function(val) {
				    	if( Number.isInteger(parseInt(val)) ) return {status: true};
							else return {status: false, msg: messages.number};
						},
						'type': function(val, type) {
							var response; 
							switch( type ) {
								case 'email':
									response = rules['email'](val);
									break;
								case 'tel':
									response = rules['tel'](val);
									break;
								case 'password':
									response = rules['length'](val, [3]);
									break;
								case 'textarea':
									response = rules['length'](val, [6]);
									break;
								case 'number':
									response = rules['number'](val);
									break;
								case 'range':
									response = rules['number'](val);
									break;
								case 'url':
									response = rules['pattern'](val, /^((http[s]?|ftp):\/\/)?[^\.]\w+\.\w+(\.\w+)*\/?(\w+\/?)*(\?([\w\-]+|([\w\-]+=[\w\-]+))?)?(#[\w\-]*)?$/);
									break;
								default:
									response = rules['required'](val);
							}

				    	return response;
						}
					};

			// Run plugin
			init(options);

			// Update defaults with options, run forms' analyzer
			function init(options) {
				$.extend(defaults, options);

				if( defaults.language ) {
					messages = $['validityLanguage_' + defaults.language]();
				}

				if( defaults.rules ) {
					$.extend(rules, defaults.rules);
				}

				analizeForms();
			}

			// Analize forms, create input set, bind form events
			function analizeForms() {
				$forms.each(function() {
					var $form = $(this),
							fieldset = [];

					$form.find(defaults.elements).not(defaults.exclude).each(function() {
						var $this = $(this),
								name = $this.attr('name'),
								attributes = $this[0].attributes;

						fieldset[name] = [];
						fieldset[name]['tagName'] = $this[0].tagName.toLowerCase();
						fieldset[name]['type'] = $this[0].type;
						
						var rules = '';
						if( $this.data('rules') ) {
							rules = $this.data('rules').split('|');
							rules.forEach(function(item, i) { rules[i] = item.replace(/\s/g, "") })
						}
						fieldset[name]['rules'] = rules;

						var attr = ['required', 'maxlength', 'pattern', 'min', 'max'];
						fieldset[name]['attr'] = [];
						attr.forEach(function(item) {
							if( item in attributes ) {
								fieldset[name]['attr'][item] = $this.prop(item);
							}
						});
						fieldset[name]['attr']['type'] = fieldset[name]['type'];
					});
					if(defaults.debug) console.log(fieldset);
					$form.attr('novalidate', true);

					$form.submit(function(e) {

						// Validate form
						if( validate(this, fieldset) ) {
							defaults.onValidationOk(e, $form);
						} else {
							if( defaults.focusInvalid ) {
								$form.find("."+defaults.inputStyle+ "_"+ defaults.errorClass).first().focus();
							}
							defaults.onValidationError($form, messages.validation_error, 'error');
						}
						return false;
					});
				});
			}

			// Validate set of form's inputs
			function validate(form, fieldset) {
	// console.log(fieldset);
				var $form = $(form),
						isValid = true;

				$form.find('.validity-note').remove();
				$form.find('.'+defaults.inputStyle + '_' + defaults.errorClass).removeClass(defaults.inputStyle + '_' + defaults.errorClass);

				for( name in fieldset ) {
					var $field = $form.find('[name='+ name +']'),
							field_value = '',
							show_name = '',
							testValid,
							errorMsg = '';

					if( $field.length > 0 ) {
						field_value = $field.val().trim();	
						$field.val(field_value);
					} else {
						if(defaults.debug) console.log('%c Field "'+ name + '" have been lost!', 'background-color: red; color: white;');

						if( defaults.detectIntervention ) {
							if(defaults.debug) console.log('%c '+ messages.detect_intervention, 'background-color: red; color: white;');
							showFormMsg($form, messages.detect_intervention, 'error');
							isValid = false;
							break;
						} else {
							continue;
						}
					}


					if( defaults.show_names && $field.data('fieldname') ) show_name = '"' + $field.data('fieldname') + '" ';

					// validate by rules
					if( fieldset[name].rules.length > 0 ) {
						if( field_value.length == 0 && fieldset[name].rules.indexOf('required') == -1 ) {
							testValid = {status: true};
						} else {
							fieldset[name].rules.forEach(function(rule) {
								var rule_params = rule.match(/\([^\)]*\)/);
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

					// validate by input type and attributes
					} else if( Object.keys(fieldset[name].attr).length > 0 ) {
						if( field_value.length == 0 && !fieldset[name].attr.hasOwnProperty('required') ) {
							testValid = {status: true};
						} else {
							for( attr in fieldset[name].attr ) {
								console.log('field = '+ name +' ; attr = '+attr);
								testValid = rules[attr](field_value, fieldset[name].attr[attr]);

								if( !testValid.status && errorMsg == '' ) errorMsg = testValid.msg.replace(/%name\W/, show_name);
							}
						}
					} else {
						testValid = {status: true};
					}

					if( errorMsg !== '' ) {
						if( defaults.inputError.styling ) {
							inputStyling($field, 'error');
						}
						if( defaults.inputError.showMsg ) {
							showInputMsg($field, errorMsg, 'error');
						}
					} else {
						if( defaults.inputSuccess.styling ) {
							inputStyling($field, 'success');
						}
						if( defaults.inputSuccess.showMsg ) {
							showInputMsg($field, defaults.inputSuccess.msg, 'success');
						}
					}


					if ( isValid ) isValid = testValid.status;
				}

				return isValid;
			}

			// Add some attribute to <form> tag
			function configure_form($form) {
				if( !$form.attr('method') || $form.attr('method') == '' ) {
					$form.attr('method', defaults.method);
				}
				if( !$form.attr('action') || $form.attr('action') == '' ) {
					$form.attr('action', defaults.action);
				}
			}

			function inputStyling($field, status) {
				if( status == 'error' ) {
					classSuffix = defaults.errorClass;
				} else if( status == 'success' ) {
					classSuffix = defaults.successClass;
				} else {
					classSuffix = defaults.warningClass;
				}

				if( defaults.inputStyle ) $field.addClass(defaults.inputStyle + '_' + classSuffix);

				$field.keypress(function() {
					$field.removeClass(function (index, className) {
				    return (className.match (new RegExp('^'+defaults.inputStyle,"g")) || []).join(' ');
				  });
					$field.parent().find('.validity-note').remove();
				});
			}

			// Show message with result of input validation
			function showInputMsg($field, msg, status) {
				var position = defaults.position.split('|')
						classSuffix = '';

				if( status == 'error' ) {
					classSuffix = defaults.errorClass;
				} else if( status == 'success' ) {
					classSuffix = defaults.successClass;
				} else {
					classSuffix = defaults.warningClass;
				}

				if( position[0] == 'static' ) {
					$field.after("<div class='validity-note validity-note_static validity-note_"+ classSuffix +"'>"+ msg +"</div>");
				} else {
					var $parent = $field.parent(),
							style = 'position:' + position[0] +';',
							tooltip = '';

					positions = position[1].split('/');

					positions.forEach(function(pos) {
						var pos_name, pos_param; 

						if( /\[.*\]/.test(pos) ) {
							pos_name = pos.replace(/\[.*\]/, '');
							pos_param = pos.match(/\[.*\]/)[0].replace(/[\[\]]/g, '');
						} else {
							pos_name = pos;
							pos_param = 0;
						}
						style += pos_name + ': '+ pos_param +';';
					});

					if( status !== 'success' || (status == 'success' && defaults.inputSuccess.tooltip) ) {
						if( defaults.tooltip && position[0] == 'absolute' ) {
							var tooltip_style = 'position: absolute;';

							defaults.tooltipPos.split('/').forEach(function(pos) {
								var pos_name, pos_param;
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
					}

					$parent.css('position', 'relative');
					$parent.append("<div class='validity-note validity-note_"+ classSuffix +"' style='"+ style +"'>"+ msg + tooltip +"</div>")
				}
				// console.error(msg);
			}

			function showFormMsg($form, msg, status) {
				var $msgBox = $('.msgBox');

				if( !$msgBox.length ) {
					$form.append("<div class='msgBox'></div>")
				}

				$msgBox = $('.msgBox').addClass('msgBox_'+ status);

				$msgBox.html(msg);

				$msgBox.fadeIn('fast', 'linear', function () {
					$(this).animate({ opacity: 1, 'top': "+=50" }, 500);
				});

				setTimeout(function () {
					$msgBox.animate({ opacity: 0, top: "-=50" }, 500, function () {
						$(this).fadeOut(function () {
							$(this).remove();
							$form.find('button, input[type="submit"]').attr('disabled', false);
							if( status == 'success' ) {
								$form[0].reset();
								$.modal.close();
							}
						});
					});
				}, 4000);
			}

			return this.init;
		}
	});
})(jQuery);

/* TODO:
** ---done--- 1. Валидация по типу поля
** ---done--- 2. Уведомление о вмещательстве в поля формы - true|false
** 3. Уведомления отправки/неотправки формы - showFormMsg()
** ---done--- 4. Уведомление об успешной валидации поля - true|false
** 5. Редирект после успешной отправки формы - true|false
*/