/** 蓝湖工具栏图标：按中文标签匹配。公共工具三端共用。 */
(function (global) {
    const FILES = {
  "融合配准": "SketchPngf28f34f73a307e0bd41700b2dd0620948ed3e39ce60582019bc466966b0c6e5f.png",
  "移动/旋转": "SketchPng75e9e5b03ab61482a307b652ea7e46a2d5991cd2a0435558881aa30bee3882c2.png",
  "灰度配准": "SketchPngb51c74644b8b4b3ea56306304cff225d5c09d2c48865d86338afa82faccc4a9b.png",
  "区域配准": "SketchPng56e5ce1ddd2e2d761e339ddde078c8bcfd8de26544ed93987ed44b6a73c16262.png",
  "ROI/POI配准": "SketchPng91997a7d4c51a548847e8771f560f798471af46f85685ef4566e070db2ca987b.png",
  "全局形变配准": "SketchPng16b51896682a154d61b10e5310ca5bfa2c385c4c3964d7319d00febc76d57067.png",
  "ROI形变配准": "SketchPngd585f32ad41106d4110ed56e1527b3d2c57536d6093f9560c465d0117ad43f7e.png",
  "形变审查": "SketchPng252f1e70ef68ee93331a5e3489040f9f397d792b7c8524c03fd54e5a16f9da1f.png",
  "自动勾画": "SketchPng8dc6955bbbbe04227e390240cd0a37ae0d96452b2d16525ae8a33dc74569a70e.png",
  "画刷": "SketchPngbe4473eedc5ee6f748a31290b358698cfea07730a60020f7411af8cd830a2afe.png",
  "画笔": "SketchPngbd56f66fc8f3d578fe542a0117e8441b56676d89f76e4f617efa13429ee5dee4.png",
  "图形": "SketchPngc2f1521d285149a039c04e23157467b678cffb2249db434dacec28b5a8b50b07.png",
  "外扩/缩小": "SketchPng5e6401800e37f8c87059ba8671263ef6e28122c449c51576e10cc9ebf8d8733b.png",
  "外扩环带": "SketchPng16c556ccae1b181402b4f4af090fa39bca52b7f6b31b27f9e996decce6cbc5ac.png",
  "裁切": "SketchPngde0f4db582c7bf6042aac40f4dfdfeae4fdd929c3ba97d4a627c796c62a38f6c.png",
  "切割": "SketchPng5006f655a21cff02706a6272f663e55e6f7f030b093bdf4e460a4d732f309ae1.png",
  "组合公式": "SketchPngc1266c53269c6f4fcb03756e6013381f8cf56e02e5e856d2f3028a6e61a0e460.png",
  "清除小轮廓": "SketchPng2a265cbe7dcb026573f55a53fd2bc7da85d06379029b8a60f76b8520a0c7739e.png",
  "HU值勾画": "SketchPng9f01ef6bac7acbefe1e5198957897dabd15a7b1254dee2869bb8fbe98e2a52d4.png",
  "高密度勾画": "SketchPngaee5b54dd03e57434ff819017ace76976ca5500392c65416a6514625f82d7a3b.png",
  "生成bolus": "SketchPngfc1e2c952df1f2d5b80934eda02efec5b9dde07fae8c4b4486357adcf1788c32.png",
  "设置床结构": "SketchPngeda00ec8330064b618a381f53b1d35d8c99b0c00f9649388d129ea5e42571403.png",
  "设置床模版": "SketchPng447ccd6579dad9a063ded5a69af93bfcd84e19093831e9ca3da1d6d6d166aeca.png",
  "生成晶格靶区": "SketchPngdb93b61d4d53108425f1166fd9f7f55dc4cc258d1a29f706af3e20c93a9190fe.png",
  "编辑晶格靶区": "SketchPngcff4322299db15858b297d5f3281a6da6d259ce97abf208010e139669dcac720.png",
  "晶格靶区勾画参数": "SketchPng60ad5fb44c7e39fb2e561c2832f31bba5aca779459d330e99745c731783d3bda.png",
  "插值勾画": "SketchPngba743f2d9fa353692ff12741c36c84737efe37dda49997539314ae321fa84ef5.png",
  "隔层删除": "SketchPng43c45c67ba4d1db702538d2f6b789c28cd512f2fd51754cdff3fce51e2ebeee0.png",
  "复制": "SketchPng10afd77f08c177cdcaab000b5417ec344dedc78aaa3f46086bb81521fd80a6c2.png",
  "粘贴": "SketchPng15529508fa0fcc8c6dddf1b6f02210973ba8ed5f6386f57411dc2b86bc4f3ed8.png",
  "PET阈值勾画": "SketchPngb1a3202ba6fb89df7b1e431e60aafadf740a8fcc0819ab5a54ce3e09eca02397.png",
  "勾画差异分析": "SketchPng54844b181183a8644bde336298e0feec23a6652890df770f425593d77dac4965.png",
  "勾画审核": "SketchPng6aea98724c48a750a021e1e4ffa06da5f1ebcc644751619a677f0441fb249dcf.png",
  "勾画解锁": "SketchPng81dbb21935584c88e88506ac7d83f02c1be634c082988d309bb949cada4b79bc.png",
  "重置配准": "SketchPng647f9053cd8e4e1b7bc93134948c8edc0e359a56ba8686d7352cf6e40ff2f960.png",
  "新建计划": "SketchPngedfde036b4a9141419bb8333396d03a6e69321a75b2106a984c579e641abc928.png",
  "复制计划": "SketchPngcae784f7b85daa4931aa58641962268f99eab25f968c2a4581da5bf20958ff33.png",
  "编辑计划": "SketchPngfac770c4091744d721b13a0dd3aea53568d0ef5c4bb58bc671ddda2b3ce9f06e.png",
  "删除计划": "SketchPng4b2b6c0f509a375d2e9892631826d71472416aba9bf5a303be97bea8bae71dc5.png",
  "标记定位点": "SketchPng72f9c89a9e94eeaaff874c11387436951480787a723c789fd02b755c92dcc35e.png",
  "设置移床值": "SketchPngdb3bdf888384bf94ccd3aa5ee7648afcbe47b880e95423b9af9237ed2160eb2b.png",
  "射束编辑": "SketchPng41f09e00d9c85ba699abdda7dfc5fde699e45fbcb41a21f2bf02b30bcb91016f.png",
  "计算域": "SketchPnge350b8f74b62c6eacacd599a8e06d23cb41fed44dfcbe4eda9b69cf3e1be4570.png",
  "MLC&JAW": "SketchPng1dd745de82d483f387b1abafa684f87a231c96785a3488604ef6f365d93c40b3.png",
  "射束动画": "SketchPng4bb0b601baf743d35f86f0cf533c9c4d3ea64adbeb11fba2210a4507dbdb44b7.png",
  "射束推荐": "SketchPng7c41365cdd64917eff4597c9e3e0779605504bf83ba10aed0d09a2c03fd3488c.png",
  "虚拟物理师": "SketchPng8f421c08c2649c4a26d91246bf7ecc90a75b80e9b7985d907ea4fa4659254d6b.png",
  "生成计划库": "SketchPnga71e7a7b8a998d44acae44a1aad60599c8df034d378b36507ba715316844c224.png",
  "生成晶格计划库": "SketchPng785e790e7a354606b2752ac15f1372b87e4d3ac0ffc8842761927ef88ef7b2b3.png",
  "射束适形": "SketchPng3603cfca7ee371dcda711a321db1350f3d9626b3d6a9a977943c35f25edd95c3.png",
  "生成形状野": "SketchPng4fb4c8728ebab27f9a34bd42a3b00fb26b11af3949bf127cc12d5dc4d9b80703.png",
  "剂量计算": "SketchPnge349d32b9949c675a54791c7c83fb043703bb4c08e916bf9ceb61bedf6b7342e.png",
  "剂量计算设置": "SketchPng658265803c5506e943eaaeceb79b45623f04ac865553e459869bd20a94c7bffc.png",
  "剂量缩放": "SketchPngd24a226d8cc7223e49ec80e89cf38c9505c346a64c44e2058a313ebe6584eee5.png",
  "MU取整": "SketchPng82a70d67ccc6cbef5ce309d373c2b7d0aa09ad8295bc5f00131292020a1952ed.png",
  "设置挡块": "SketchPngbfbf5151e91c0534e418892c50eec9c078b164bbbf3f8531329f7b7ed346e490.png",
  "自适应计算": "SketchPng2aec55ad5a0904936da620058a4bc73595eac93d4cd1910997835503fc529c85.png",
  "再计划判断": "SketchPng6d2312ef42392c5a7176cbdef4c52758a09618a418cd9d539d31e0b4ca9d2442.png",
  "ART计划评估": "SketchPng76d235b3fac728a693613a44c1d920aeb5489f55f43ef8636fac7b9f9b82a5a0.png",
  "导出报告": "SketchPng399788aed256457736773410dc0dbb77fec6ddffcccbb1dad55d452875bf21e4.png",
  "二次剂量验证": "SketchPnga6fcf48404f32a085a03fd93cfa9d8110a4a67241e16ec8b1e307289b52f67f6.png",
  "计划审批": "SketchPng5fee4002d8a2d18df24371692d927ca72f84425cf736bdc113726d6077d6d422.png",
  "计划解锁": "SketchPng7caee17f3d800f1abfbcff397d0607ca65aea59ee1ec1ed5fdfb7d3e59dc5985.png",
  "图像增强": "SketchPng525b8498b1bc740c80e4503fd24eb0cbaf81dde4fd3a8ff8c07c33960f1af879.png",
  "图像拼接": "SketchPngcc6e60a63603a4d2ebcbab2f5a53fe1f609e450b1a5bb41b25d0b7da359a18f3.png",
  "图像转换": "SketchPng3e3173595bcc2144844309a5ff9e0dac2e569b4fcf2a8a6de8e98175f1332671.png",
  "确认唯一勾画": "SketchPngf5796937c5dbb4403d974f1728ac3e82541650ae181eb23c016767cb704fa7c2.png",
  "勾画QA": "SketchPng2b073ffe40cbf1cc3061145b78e8ad9f5abc54d12abb1b3177553903dbac17b2.png",
  "新建自适应计划": "SketchPnga8afb444938bf3c380aad00de5d58cc707dce056b7b6aadefebc50a15900e12f.png",
  "自动优化": "SketchPngb5b9a0174983b97a11940d25f606f9c0cdfc3e79793a9ca7808b3abab6a3fa9d.png",
  "优化设置": "SketchPnge3803b7ebb5eae13c22d2a6607599f075f3b39055b0ede6af2affadc42662957.png",
  "计划跌落": "SketchPngfebe360a2c5d049aaf4c824c1490d03032b6098ea3cc3d9d242a3ea5ff59050f.png",
  "结束优化": "SketchPngda27a60a461867bb04924872f8c9bee95da618de7ce3638211169f374f587dd3.png",
  "继续优化": "SketchPngae01fe643f2071c0cbbaf4a6090aba06773d844304b26548d91903865b8d9747.png",
  "重新优化": "SketchPng3b7d5ced044f6dadb3a51f10a64448c33a9e4988d820638af540b871d858714e.png",
  "取消优化": "SketchPngda27a60a461867bb04924872f8c9bee95da618de7ce3638211169f374f587dd3.png",
  "计划精灵": "SketchPng6fc95f5f2bb805d0a5b3978d5c7b8a8baca6b91629ab039755f3149321cb357f.png",
  "剂量预测": "SketchPng08206f16c910c1ceec7091e167632f0f0a255077861ba83a1428db82a54e64f1.png",
  "分布式帕累托优化": "SketchPngcbeb5458197b9ee3c14ff4aed0556ff7da4eaf664e4d6a282fddc2eab876fe7b.png",
  "鲁棒性设置": "SketchPng48460e5a3a059d69a56deaae9bd7d7570fb2b20dab073461939aa7a811a8d42c.png",
  "生物剂量转换": "SketchPngee7ca4d781f05e2ddfdcde51bd0f107241dbddacdb0e14d8b0b7a0d5b189aac6.png",
  "计划对比": "SketchPngbdbe1361d5a2e9fb0f685ee832fe8bc83a72cefa956ebc8650ded1c0ea91b21d.png",
  "取消对比": "SketchPng1cfddf02ef5a4ef5acc8bb598ecdfee0c9f701f9767d83be538a56d3655323ea.png",
  "在线ART设置": "SketchPng54e92b9073ee29db230717ac19bcb8951e7404edf6b562e9a8a0234d50d0149b.png",
  "创建QA计划": "SketchPnge6c4d2fb40cc23f20e04fa499f06294f17193140950d3cea110ed6d1c60ed053.png",
  "导出平面剂量": "SketchPng898b68e87c806774489322a8fba0735f41a50071f36ec74a92bd6819230ae0ca.png",
  "查看偏移值": "SketchPng6413bbd0c67bd286dfddca145d1105d586be17427c0421efcaab9f1de66faf64.png",
  "编辑": "SketchPng174cf95d0474e8c1912f51c33a40e58c89559d57f0173f96d08b262bde415cb2.png",
  "区域增长": "SketchPng96c2a8986a50e54dcc1d2efadb52c62ba8a633ee2991b7ae66d4886fe7b7096c.png",
  "外扩": "SketchPng5e6401800e37f8c87059ba8671263ef6e28122c449c51576e10cc9ebf8d8733b.png",
  "裁剪": "SketchPngde0f4db582c7bf6042aac40f4dfdfeae4fdd929c3ba97d4a627c796c62a38f6c.png",
  "保存": "SketchPngef9c86fd9dd6064a58defb8e85dc31a791a34f5edd0f85f316e661d8958467d4.png",
  "导入": "SketchPnga64714fb333f907de1f264eb02b65bcd3f9e22a3723d2739f66eccdf26f04d78.png",
  "导出": "SketchPng399788aed256457736773410dc0dbb77fec6ddffcccbb1dad55d452875bf21e4.png",
  "弃审": "SketchPngb007170de8d429201783b4690c818bb703d18703a62da401a9f9c7bfe5138276.png",
  "删除": "SketchPng950133792dd3d75193435b8fc44b7f851e06107b4f446afff9df166f473ad003.png",
  "计划优化": "SketchPnga16d7523bf7aea370b7d8b09a510a9d56ef13c7293f4ada312f797a9bf8f0994.png",
  "剂量调整": "SketchPngeb0c6ba21fb9cf20992d01172782e15cf126343f4a4c88118b9758278154a7bf.png",
  "添加定位器": "SketchPng11e04f253d4839caef34af5a93b3eaa61da64aad306aaf6ae72275eedba7ffdc.png",
  "逆向布针": "SketchPng51350248eb6625981dff85cf1d36c6addba25dfe192ad094ec595b5b5fe6e245.png",
  "剂量网格": "SketchPng07b83fecc1d6997876817cf37329c9f5e79538d6281ec431b50ec22e18d3ec0e.png",
  "结构": "SketchPng1cbbb7ab256c591d4c2188f9d6237d49bc9b27fed737362014d692dc4730bf54.png",
  "处方设置": "SketchPngfc102a89d7807cb5010c9068b2b8db33a5f81543b37174b62b0424eaf4ccee51.png",
  "添加床结构": "SketchPng54da01f41a51b8907422601c6f167f5600d38b1a647409f06af5b1ce5682354c.png",
  "电子密度": "SketchPngc91193fd319f7680a69e2af6f565deb23ab41d230ce8f1beb58f6050d8863170.png"
};
    const ALIAS = {
  "图像融合": "融合配准",
  "显示融合": "融合配准",
  "移动": "移动/旋转",
  "旋转": "移动/旋转",
  "边框配准": "区域配准",
  "形变配准": "全局形变配准",
  "生成Bolus": "生成bolus",
  "移床值": "设置移床值",
  "设置移床值": "设置移床值",
  "开始优化": "计划优化",
  "计划库": "生成计划库",
  "审核计划": "计划审批",
  "解除计划": "计划解锁",
  "查看位移值": "查看偏移值",
  "保存配准": "保存",
  "配准重置": "重置配准",
  "创建鲁棒性评估": "鲁棒性设置",
  "创建鲁棒性": "鲁棒性设置"
};

    function iconBase() {
        const script = document.querySelector('script[src*="MoziToolbarIcons.js"], script[src*="ModuleToolbarComponent.js"]');
        if (script && script.src) {
            return script.src.replace(/scripts\/components\/[^/]+\.js.*$/, 'assets/icons/');
        }
        return '../../shared/assets/icons/';
    }

    function fileFor(key) {
        if (!key) return '';
        const compact = String(key).replace(/\s+/g, '');
        const mapped = ALIAS[compact] || compact;
        return FILES[mapped] || FILES[compact] || '';
    }

    function url(key) {
        const file = fileFor(key);
        return file ? iconBase() + file : '';
    }

    function html(key) {
        const src = url(key);
        if (!src) return '';
        return '<img class="module-tool-lanhu-icon" src="' + src + '" alt="" draggable="false">';
    }

    global.MoziToolbarIcons = { FILES, ALIAS, fileFor, url, html };
})(window);
