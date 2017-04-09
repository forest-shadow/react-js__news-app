'use strict';

let my_news = [
    {
        author: 'Саша Печкин',
        text: 'В четчерг, четвертого числа...',
        bigText: 'в четыре с четвертью часа четыре чёрненьких чумазеньких чертёнка чертили чёрными чернилами чертёж.'
},
{
    author: 'Просто Вася',
    text: 'Считаю, что $ должен стоить 35 рублей!',
    bigText: 'А евро 42!'
},
{
    author: 'Гость',
    text: 'Бесплатно. Скачать. Лучший сайт - http://localhost:3000',
    bigText: 'На самом деле платно, просто нужно прочитать очень длинное лицензионное соглашение'
}
];

window.ee = new EventEmitter();

let Article = React.createClass({
    propTypes: {
        data: React.PropTypes.shape({
            author: React.PropTypes.string.isRequired,
            text: React.PropTypes.string.isRequired,
            bigText: React.PropTypes.string.isRequired
        })
    },
    getInitialState: function() {
        return {
            visible: false
        };
    },
    readmoreClick: function(e) {
        e.preventDefault();
        this.setState({visible: true});
    },
    render: function() {
        let author  = this.props.data.author,
            text    = this.props.data.text,
            bigText = this.props.data.bigText,
            visible = this.state.visible; // считываем значение переменной из состояния компонента;

        return (
            <div className="article">
                <p className="news__author">{author}:</p>
                <p className="news__text">{text}</p>
                {/* для ссылки readmore: не показывай ссылку, если visible === true */}
                <a href="#"
                   onClick={this.readmoreClick}
                   className={'news__readmore ' + (visible ? 'hide': '')}>
                    Подробнее</a>
                {/* для большо текста: не показывай текст, если visible === false */}
                <p className={'news__big-text ' + (visible ? '': 'hide')}>{bigText}</p>
            </div>
        )
    }
});

let News = React.createClass({
    getInitialState: function() {
        return {
            counter: 0
        };
    },
    newsClick: function(e) {
        e.preventDefault();
        this.setState({counter: ++this.state.counter});
    },
    render: function() {
        let data = this.props.data;
        let newsTemplate;

        if (data.length > 0) {
            newsTemplate = data.map(function(item, index) {
                return (
                    <div key={index}>
                        <Article data={item} />
                    </div>
                )
            });
        } else {
            newsTemplate = <p>К сожалению новостей нет</p>
        };

        return (
            <div className="news">
                {newsTemplate}
                <strong
                    onClick={this.newsClick}
                    className={data.length > 0 ? '':'none'}>
                    Всего новостей: {data.length}
                </strong>
            </div>
        );
    }
});

let Add = React.createClass({
    getInitialState: function() { //устанавливаем начальное состояние (state)
        return {
            agreeNotChecked: true,
            authorIsEmpty: true,
            textIsEmpty: true
        };
    },
    componentDidMount: function() {
        ReactDOM.findDOMNode(this.refs.author).focus();
    },
    onBtnClickHandler: function(e) {
        e.preventDefault();
        let textEl = ReactDOM.findDOMNode(this.refs.text);

        let author = ReactDOM.findDOMNode(this.refs.author).value;
        let text = ReactDOM.findDOMNode(this.refs.text).value;

        let item = [{
            author: author,
            text: text,
            bigText: '...'
        }];

        window.ee.emit('News.add', item);

        textEl.value = '';
        this.setState({textIsEmpty: true});
    },
    onCheckRuleClick: function(e) {
        this.setState({agreeNotChecked: !this.state.agreeNotChecked});
    },
    onFieldChange: function(fieldName, e) {
        if (e.target.value.trim().length > 0) {
            this.setState({[''+fieldName]:false})
        } else {
            this.setState({[''+fieldName]:true})
        }
    },
    render: function() {
        let agreeNotChecked = this.state.agreeNotChecked,
            authorIsEmpty = this.state.authorIsEmpty,
            textIsEmpty = this.state.textIsEmpty;
        return (
            <form className='add cf'>
                <input
                    type='text'
                    className='add__author'
                    onChange={this.onFieldChange.bind(this, 'authorIsEmpty')}
                    placeholder='Ваше имя'
                    ref='author'
                />
                <textarea
                    className='add__text'
                    onChange={this.onFieldChange.bind(this, 'textIsEmpty')}
                    placeholder='Текст новости'
                    ref='text'
                ></textarea>
                <label className='add__checkrule'>
                    <input type='checkbox' ref='checkrule' onChange={this.onCheckRuleClick}/>Я с
                    огласен с правилами
                </label>
                <button
                    className='add__btn'
                    onClick={this.onBtnClickHandler}
                    ref='alert_button'
                    disabled={agreeNotChecked || authorIsEmpty || textIsEmpty}
                > О
                    публиковать новость
                </button>
            </form>
        );
    }
});

let App = React.createClass({
    getInitialState: function() {
        return {
            news: my_news
        };
    },
    componentDidMount: function() {
        /* Слушай событие "Создана новость" если событие произошло, обнови this.state.news */

        let self = this;
        window.ee.addListener('News.add', function(item) {
            let nextNews = item.concat(self.state.news);
            self.setState( {news: nextNews} );
            console.log(nextNews);
        });
    },
    componentWillUnmount: function() {
        /* Больше не слушай событие "Создана новость" */
        window.ee.removeListener('News.add');
    },
    render: function() {
        return (
            <div className="app">
                <Add />
                <h3>Новости</h3>
                <News data={my_news} />
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('root')
);