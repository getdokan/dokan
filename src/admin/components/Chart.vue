<script>
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-moment';

export default {
    extends: Line,
    props: ['data'],
    data () {
        return {
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        type: 'time',
                        title: {
                            display: false
                        },
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            fontColor: '#aaa',
                            fontSize: 11
                        }
                    },
                    y: {
                        title: {
                            display: false
                        },
                        ticks: {
                            fontColor: '#aaa'
                        }
                    }
                },
                legend: {
                    position: 'top',
                    onClick: false,
                },
                elements: {
                    line: {
                        tension: 0,
                        borderWidth: 4,
                    },
                    point: {
                        radius: 5,
                        borderWidth: 3,
                        backgroundColor: '#fff',
                        borderColor: '#fff',
                    }
                },
                tooltips: {
                    displayColors: false,
                    callbacks: {
                        label: function(tooltipItems, data) {
                            let label        = data.datasets[tooltipItems.datasetIndex].label || '';
                            let customLabel  = data.datasets[tooltipItems.datasetIndex].tooltipLabel || '';
                            let prefix       = data.datasets[tooltipItems.datasetIndex].tooltipPrefix || '';

                            let tooltipLabel = customLabel ? customLabel + ': ': label + ': '

                            tooltipLabel += prefix + tooltipItems.yLabel;

                            return tooltipLabel;
                        }
                    }
                }
            }
        }
    },
    mounted () {
        this.renderChart(this.data, this.options);
    }
};
</script>
