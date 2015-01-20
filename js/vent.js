define(["backbone","Marionette"],function(Backbone){
	return new Backbone.Wreqr.EventAggregator();
});

var tpldata =
{
    All: { title: 'ȫ���ļ�', router: '#all', imgUrl: 'images/icon_1.png', navigateTrigger: "rightmain:alllist" },
    Subnav:
    [
        { title: '����Ƶ', router: '#av', imgUrl: 'images/icon_4.png', navigateTrigger: "rightmain:avlist" },
        { title: 'ͼƬ', router: '#pic', imgUrl: 'images/icon_5.png', navigateTrigger: "rightmain:piclist" },
        { title: '�ĵ�', router: '#doc', imgUrl: 'images/icon_6.png', navigateTrigger: "rightmain:doclist" },
        { title: '����', router: '#other', imgUrl: 'images/icon_7.png', navigateTrigger: "rightmain:otherlist" }
    ],
    Commonly: { title: '�����ļ�', router: '#common', imgUrl: 'images/icon_2.png', navigateTrigger: "rightmain:commonlist" },
    Recycle: { title: '����վ', router: '#recycle', imgUrl: 'images/icon_3.png', navigateTrigger: "rightmain:recyclelist" }
};