import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Component from './component.js';

const BAR_HEIGHT = 55;

const getTransportData = (pointsData) => {
  const dataForTransportChart = {
    labels: [],
    data: []
  };

  const pointsTypes = pointsData[0].types;
  const transportTypes = pointsTypes.filter((it) => it.group === `transport`);

  for (const transportType of transportTypes) {
    let count = 0;

    for (const pointData of pointsData) {
      if (pointData.type.title === transportType.title) {
        ++count;
      }
    }

    if (count) {
      dataForTransportChart.labels.push(`${transportType.icon} ${transportType.title}`);
      dataForTransportChart.data.push(count);
    }
  }

  return dataForTransportChart;
};

const getMoneyData = (pointsData) => {
  const dataForMoneyChart = {
    labels: [],
    data: []
  };

  const moneyMap = new Map();
  const iconMap = new Map();

  for (const pointData of pointsData) {
    const key = pointData.type.title;
    let cost = 0;

    if (moneyMap.has(key)) {
      cost = Number(moneyMap.get(key));
    }

    moneyMap.set(key, cost + Number(pointData.price));
    iconMap.set(key, pointData.type.icon);
  }

  moneyMap.forEach((value, key) => {
    dataForMoneyChart.labels.push(`${iconMap.get(key)} ${key}`);
    dataForMoneyChart.data.push(value);
  });

  return dataForMoneyChart;
};

export default class Statistic extends Component {
  constructor(data) {
    super();
    this._barHeight = BAR_HEIGHT;
    this._data = data;

    this._transportData = null;
    this._moneyData = null;

    this._chart = null;
    this._moneyCtx = null;
    this._transportCtx = null;
    this._timeSpendCtx = null;

    this._moneyChart = null;
    this._transportChart = null;
  }

  get template() {
    return `
      <section class="statistic content-wrap visually-hidden" id="stats">
        <div class="statistic__item statistic__item--money">
          <canvas class="statistic__money" width="900"></canvas>
        </div>
        <div class="statistic__item statistic__item--transport">
          <canvas class="statistic__transport" width="900"></canvas>
        </div>
        <div class="statistic__item statistic__item--time-spend">
          <canvas class="statistic__time-spend" width="900"></canvas>
        </div>
      </section>`.trim();
  }

  renderCharts() {
    this._moneyCtx = this._element.querySelector(`.statistic__money`);
    this._transportCtx = this._element.querySelector(`.statistic__transport`);
    this._timeSpendCtx = this._element.querySelector(`.statistic__time-spend`);

    this._moneyData = getMoneyData(this._data);
    this._transportData = getTransportData(this._data);
    this._moneyCtx.height = this._barHeight * this._moneyData.labels.length;
    this._transportCtx.height = this._barHeight * this._transportData.labels.length;

    this._moneyChart = new Chart(this._moneyCtx, {
      plugins: [ChartDataLabels],
      type: `horizontalBar`,
      data: {
        labels: this._moneyData.labels,
        datasets: [{
          data: this._moneyData.data,
          backgroundColor: `#ffffff`,
          hoverBackgroundColor: `#ffffff`,
          anchor: `start`
        }]
      },
      options: {
        plugins: {
          datalabels: {
            font: {
              size: 13
            },
            color: `#000000`,
            anchor: `end`,
            align: `start`,
            formatter: (val) => `€ ${val}`
          }
        },
        title: {
          display: true,
          text: `MONEY`,
          fontColor: `#000000`,
          fontSize: 23,
          position: `left`
        },
        scales: {
          yAxes: [{
            ticks: {
              fontColor: `#000000`,
              padding: 5,
              fontSize: 13,
            },
            gridLines: {
              display: false,
              drawBorder: false
            },
            barThickness: 44,
          }],
          xAxes: [{
            ticks: {
              display: false,
              beginAtZero: true,
            },
            gridLines: {
              display: false,
              drawBorder: false
            },
            minBarLength: 50
          }],
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false,
        }
      }
    });

    this._transportChart = new Chart(this._transportCtx, {
      plugins: [ChartDataLabels],
      type: `horizontalBar`,
      data: {
        labels: this._transportData.labels,
        datasets: [{
          data: this._transportData.data,
          backgroundColor: `#ffffff`,
          hoverBackgroundColor: `#ffffff`,
          anchor: `start`
        }]
      },
      options: {
        plugins: {
          datalabels: {
            font: {
              size: 13
            },
            color: `#000000`,
            anchor: `end`,
            align: `start`,
            formatter: (val) => `${val}x`
          }
        },
        title: {
          display: true,
          text: `TRANSPORT`,
          fontColor: `#000000`,
          fontSize: 23,
          position: `left`
        },
        scales: {
          yAxes: [{
            ticks: {
              fontColor: `#000000`,
              padding: 5,
              fontSize: 13,
            },
            gridLines: {
              display: false,
              drawBorder: false
            },
            barThickness: 44,
          }],
          xAxes: [{
            ticks: {
              display: false,
              beginAtZero: true,
            },
            gridLines: {
              display: false,
              drawBorder: false
            },
            minBarLength: 50
          }],
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false,
        }
      }
    });
  }

  update(data) {
    this._moneyData = getMoneyData(data);
    this._transportData = getTransportData(data);

    this._moneyChart.data.labels = this._moneyData.labels;
    this._moneyChart.data.datasets[0].data = this._moneyData.data;
    this._transportChart.data.labels = this._transportData.labels;
    this._transportChart.data.datasets[0].data = this._transportData.data;
    this._moneyChart.update();
    this._transportChart.update();
  }
}
