// required: jQuery

// 名前空間の定義
var controller = controller || {};
(function (global) {
	// 名前空間の先頭定義
	let _ = controller;

	// 非公開変数の定義
	let g_html_contents = {};
	let g_data = [];
	let g_data_length = 0;
	let g_counter = 0;
	let g_correct_answer = 0;
	let g_random_indices = [];
	const g_fontsize = '150%';

	// ==================
	// === 非公開関数 ===
	// ==================
	/**
	  * @brief: 数値をシャッフルしたリストの生成
	  * @param: len        生成するリストの長さ
	  *         do_shuffle シャッフルの有無（true: 有、false: 無）
	  * @returns: シャッフル後のリスト
	*/
	const number_shuffle = (len, do_shuffle) => {
		// 連番の要素を持つリストの定義
		let sequential = new Array(len).fill(null).map((_, i) => i);

		// 数値をシャッフル
		if (do_shuffle) {
			for (let i = len - 1; i >= 0; i--) {
				const rand = Math.floor(Math.random() * (i + 1));
				[sequential[i], sequential[rand]] = [sequential[rand], sequential[i]];
			}
		}

		return sequential;
	};

	/**
	  * @brief: 指定した要素IDにタイトルを設定
	  * @param: idx     取得対象のインデックス
	  *         counter 現在のカウンタ値
	  *         elem_id 対象の要素ID
	  * @returns: なし
	*/
	const set_title = (idx, counter, elem_id) => {
		const element_name = `#${elem_id}`;
		// 子要素の削除
		$(element_name).empty();
		const add_elem = $('<h3></h3>').text(`第${counter}問（${g_data_length}問中） ${g_data[idx].title}`);
		$(element_name).append(add_elem);
	};

	/**
	  * @brief: 指定した要素IDに設問を設定
	  * @param: idx     取得対象のインデックス
	  *         elem_id 対象の要素ID
	  * @returns: なし
	*/
	const set_question = (idx, elem_id) => {
		const element_name = `#${elem_id}`;
		// 子要素の削除
		$(element_name).empty();
		const add_elem = $('<p></p>')
		                     .html(g_data[idx].question)
		                     .css('font-size', g_fontsize);
		$(element_name).append(add_elem);
	};

	/**
	  * @brief: 指定した要素IDの選択肢をシャッフルするリストを生成
	  * @param: idx             取得対象のインデックス
	  * @returns: rand_list
	*/
	const create_shuffle_list = (idx) => {
		const selects = g_data[idx].selects;
		const rand_list = number_shuffle(selects.length, true);

		return rand_list;
	};

	/**
	  * @brief: 指定した要素IDに選択肢を設定
	  * @param: idx             取得対象のインデックス
	  *         rand_list       選択肢並び替え用のリスト
	  *         elem_args
	  *         .selects        選択肢の要素ID
	  *         .user           userの要素ID
	  *         .result         resultの要素ID
	  *         accuracy_args
	  *         .accuracy       正解率の要素ID
	  *         .counter        現在の問題数
	  *         .correct_answer 現在の正解数
	  * @returns: なし
	*/
	const set_selection = (idx, rand_list, elem_args, accuracy_args) => {
		const accuracy_name = `#${accuracy_args.accuracy}`;
		const select_name = `#${elem_args.selects}`;
		const user_name = `#${elem_args.user}`;
		const result_name = `#${elem_args.result}`;
		const selects = g_data[idx].selects;
		const answer = g_data[idx].answer;
		const counter = accuracy_args.counter;
		let correct_answer = accuracy_args.correct_answer;
		const select_len = selects.length;
		// 子要素の削除
		$(select_name).empty();
		$(user_name).empty();

		// 設問の設定
		const table_css = {'border': 'none'};
		const table_elem = $('<table class="table">').css(table_css);
		// 10進数を16進数に変換する関数
		const dec2hex = (num, digit) => {
			const zero_padding = Array(digit + 1).join('0');
			const hex_val = (zero_padding + num.toString(16).toLowerCase()).substr(-digit);
			return hex_val;
		};

		for (let i = 0; i < select_len; i++) {
			const rand = rand_list[i];
			const btn_dec_val = i + 1;
			const btn_hex_val = ((btn_dec_val < 16) ? dec2hex(btn_dec_val, 1) : 'none');
			// ボタン要素の作成
			const btn_elem = $('<input>').attr({
				id: `select_btn${i}`,
				type: 'button',
				class: 'btn btn-success btn-block',
				css: {'font-size': g_fontsize},
				value: `${btn_dec_val} (key: ${btn_hex_val})`,
			});
			$('html').on('keyup', (event) => {
				const key_codes = {
					48:  0, 49:  1, 50:  2, 51:  3, 52:  4, 53:  5,
					54:  6, 55:  7, 56:  8, 57:  9, 65: 10, 66: 11,
					67: 12, 68: 13, 69: 14, 70: 15,
				};
				// ボタンに対応するキーが入力された場合
				const key = event.which;
				const target_idx = i + 1;
				if ((key in key_codes) && (key_codes[key] === target_idx) && $(result_name).is(':hidden')) {
					// 該当するボタンを押下
					btn_elem.click();
				}
			});
			btn_elem.on('click', () => {
				const target_idx = i + 1;
				let ret_str;
				let ret_color;
				if (answer[rand_list[target_idx - 1]] == 1) {
					ret_str = '正解';
					ret_color = '#00ee00';
					correct_answer++;
				}
				else {
					ret_str = '不正解';
					ret_color = '#ff0000';
				}
				// 格納用要素の作成
				const childe_elem = $('<p></p>')
				                        .text(`選択：選択肢${target_idx}, ${ret_str}`)
				                        .css({
				                            'font-size': g_fontsize,
				                            'color': ret_color,
				                        });
				$(user_name).append(childe_elem);
				// 非公開要素を公開
				$(result_name).show();
				// 公開した要素の位置までスクロール
				$(result_name)[0].scrollIntoView(true);
				// 正解率の設定
				$(accuracy_name).empty();
				const tmp = 1.0 * correct_answer / counter * 100.0;
				const accuracy_ratio = tmp.toFixed(2);
				const accuracy_elem = $('<h3></h3>').text(`${correct_answer} / ${counter}, ${accuracy_ratio}%`);
				$(accuracy_name).append(accuracy_elem);
				g_correct_answer = correct_answer;

				// ボタン押下禁止
				for (let j = 0; j < select_len; j++) {
					$(`#select_btn${j}`).prop('disabled', true);
				}
			});
			const text_elem = $('<span></span>')
			                      .html(selects[rand])
			                      .css('font-size', g_fontsize);
			const td_btn = $('<td></td>').html(btn_elem).css(table_css);
			const td_txt = $('<td></td>').html(text_elem).css(table_css);
			const tbl_tr = $('<tr></tr>').css(table_css).append(td_btn, td_txt);
			table_elem.append(tbl_tr);
		}
		$(select_name).append(table_elem);
	};

	/**
	  * @brief: 指定した要素IDに解答を設定
	  * @param: idx       取得対象のインデックス
	  *         rand_list 選択肢並び替え用のリスト
	  *         elem_id   対象の要素ID
	  * @returns: なし
	*/
	const set_answer = (idx, rand_list, elem_id) => {
		const elem_name = `#${elem_id}`;
		const answer = g_data[idx].answer;
		const select_len = answer.length;
		// 子要素の削除
		$(elem_name).empty();

		// 解答の探索
		let target_idx = -1;
		for (let i = 0; i < select_len; i++) {
			if (answer[rand_list[i]] == 1) {
				target_idx = i + 1;
				break;
			}
		}
		if (target_idx > 0) {
			// 格納用要素の作成
			const childe_elem = $('<p></p>')
			                        .text(`解答：選択肢${target_idx}`)
			                        .css('font-size', g_fontsize);
			$(elem_name).append(childe_elem);
		}
	};

	/**
	  * @brief: 指定した要素IDに解説を設定
	  * @param: idx       取得対象のインデックス
	  *         rand_list 選択肢並び替え用のリスト
	  *         elem_id   対象の要素ID
	  * @returns: なし
	*/
	const set_explanations = (idx, rand_list, elem_id) => {
		const elem_name = `#${elem_id}`;
		const explanations = g_data[idx].explanations;
		// 子要素の削除
		$(elem_name).empty();
		// 解説の設定
		const expl_len = explanations.length;
		if (expl_len == 1) {
			// 格納用要素の作成
			const childe_elem = $('<p></p>')
			                        .html(explanations[0])
			                        .css('font-size', g_fontsize);
			$(elem_name).append(childe_elem);
		}
		else {
			const parent_elem = $('<ul></ul>');
			for (let i = 0; i < expl_len; i++) {
				const target_idx = i + 1;
				const exp_prefix = `選択肢${target_idx}は`;
				// 格納用要素の作成
				const childe_elem = $('<li></li>')
				                        .html(exp_prefix + explanations[rand_list[i]])
				                        .css('font-size', g_fontsize);
				parent_elem.append(childe_elem);
			}
			$(elem_name).append(parent_elem);
		}
	};

	// ========
	// 公開関数
	// ========
	/**
	  * @brief: 起動時の初期化処理
	  * @param: args
	  *         .shuffle      シャッフルのチェックボックスID
	  *         .accuracy     正答率の要素ID
	  *         .title        タイトルの要素ID
	  *         .question     設問の要素ID
	  *         .selects      選択肢の要素ID
	  *         .result       解答関係の要素ID
	  *         .answer       解答の要素ID
	  *         .user         ユーザの選択肢の要素ID
	  *         .explanations 解説欄の要素ID
	  *         data          利用するデータセット
	  * @returns: なし
	*/
	_.InitController = (args, data) => {
		// 引数のコピー
		g_html_contents = {
			shuffle:      args.shuffle,
			accuracy:     args.accuracy,
			title:        args.title,
			question:     args.question,
			selects:      args.selects,
			result:       args.result,
			answer:       args.answer,
			user:         args.user,
			explanations: args.explanations
		};
		g_data = data;
		g_data_length = data.length;
		// Resetの実行
		controller.Reset();
		// Nextの実行
		controller.Next();
	};

	_.Reset = () => {
		// 実行順序を乱数で決定
		const do_shuffle = $(`#${g_html_contents.shuffle}`).prop('checked');
		g_random_indices = number_shuffle(g_data_length, do_shuffle);
		g_counter = 0;
		g_correct_answer = 0;
		const accuracy_name = `#${g_html_contents.accuracy}`;
		$(accuracy_name).empty();
	};

	_.Next = () => {
		if (g_counter >= g_data_length) {
			controller.Reset();
		}
		const counter = g_counter;
		const idx = g_random_indices[counter];
		// 選択肢を乱数で決定
		const random_selection = create_shuffle_list(idx);
		// タイトルの設定
		set_title(idx, counter + 1, g_html_contents.title);
		// 設問の設定
		set_question(idx, g_html_contents.question);
		// 選択肢の設定
		const selection_args = {
			selects: g_html_contents.selects,
			user:    g_html_contents.user,
			result:  g_html_contents.result,
		};
		const accuracy_args = {
			accuracy: g_html_contents.accuracy,
			counter:  counter + 1,
			correct_answer: g_correct_answer,
		};
		set_selection(idx, random_selection, selection_args, accuracy_args);
		// 解答の設定
		set_answer(idx, random_selection, g_html_contents.answer);
		// 解説の設定
		set_explanations(idx, random_selection, g_html_contents.explanations);
		$(`#${g_html_contents.result}`).hide();
		g_counter = counter + 1;
	};

}(this));

if (typeof module !== 'undefined') {
	module.exports = controller;
}
