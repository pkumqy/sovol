$(function () {

    custom_function = {};
    figures = {};
    sim_start = false;
    sim_id = 0;

    function checkReady() {
        if (!Module)
            return;
        $('#start').removeAttr("disabled");
    };
    setTimeout(checkReady, 1000);

    $('#start').click(function () {
        if (sim_start) {
            return;
        } else {
            clearFigures();
            sim_start = true;
            let key_perfix = 'SC_';
            let obj = {};
            $('.simulation-input').find('input, select').filter(':visible').each((i, e) => {
                let value;
                if (e.name.startsWith('CUSTOMFIELD_')) {
                    if (custom_function[e.name]) {
                        removeFunction(custom_function[e.name]);
                    }
                    custom_function[e.name] = addFunction(new Function('x', 'y', 'z', 't', e.value), 'ddddd');
                    value = custom_function[e.name].toString();
                } else {
                    if ($(e).hasClass('eval')) {
                        value = eval(e.value).toString();
                    } else {
                        value = e.value.toString();
                    }
                };
                obj[key_perfix + e.name] = value
            });
            nextData(Module.initSimulation(obj), ++sim_id);
        }
    });

    function nextData(sim, id) {
        if (!sim_start || id < sim_id) {
            delete sim;
        } else {
            let data = Module.runAndGetData(sim);
            if (data.finished) {
                sim_start = false;
                delete sim;
            } else {
                if (data.data) {
                    if (data.isEndTime) {
                        addData(data.data, true);
                    } else {
                        addData(data.data);
                    }
                }
                setTimeout(nextData, 0, sim, id);
            }
        }
    }

    $('#stop').click(() => {
        sim_start = false;
    });

    function changeFieldType() {
        let name = $('#FIELD_CLASSNAME > option:selected').val();
        $('.field-args').css("display", "none");
        $('#' + name + '_args_div').css("display", "");
    }

    changeFieldType();
    $('#FIELD_CLASSNAME').change(changeFieldType);

    variables = {
        x: {
            unit: "c/ω",
            processData: (data) => data.x,
        },
        y: {
            unit: "c/ω",
            processData: (data) => data.y,
        },
        z: {
            unit: "c/ω",
            processData: (data) => data.z,
        },
        px: {
            unit: "m_e c",
            processData: (data) => data.px,
        },
        py: {
            unit: "m_e c",
            processData: (data) => data.py,
        },
        pz: {
            unit: "m_e c",
            processData: (data) => data.pz,
        },
        Ek: {
            unit: "m_e c2",
            processData: (data) => data.Ek,
        },
        t: {
            unit: "1/ω",
            processData: (data) => data.t,
        }
    }


    $('#particles_plots_input select').each((i, e) => {
        let je = $(e);
        for (const key in variables) {
            je.append('<option value="' + key + '">' + key + '</option>');
        }
    });

    $('#add_particles_plot').click(function () {
        let figure = {};
        let inp = {};
        $('#particles_plots_input').find('input, select').each((i, e) => inp[e.name] = e.value);
        let id = 'particles_plot_' + Math.random().toString().substr(-8);
        let title = inp.xaxis + '-' + inp.yaxis;
        if (inp.zaxis) {
            title += '-' + inp.zaxis;
        }
        $('#particles_plots').prepend(
            '<div class="input-div">\
                <div class="table-title">' + title + '</div>\
                <div class="figure" id="'+ id + '">\
                </div>\
                <table class="input-table">\
                    <tr>\
                        <td>\
                            <button class="remove-button red-button" data-figureid="'+ id + '">Remove</button>\
                        </td>\
                    </tr>\
                </table>\
            </div>');
        let plot = echarts.init($('#' + id)[0]);
        figure.plot = plot;
        figure.id = id;
        figure.initSeries = function () {
            this.series = [];
            this.addSeries();
        };
        if (inp.zaxis) {
            plot.setOption({
                tooltip: {},
                backgroundColor: '#fff',
                xAxis3D: {
                    type: 'value',
                    name: inp.xaxis + ' [' + variables[inp.xaxis].unit + ']',
                },
                yAxis3D: {
                    type: 'value',
                    name: inp.yaxis + ' [' + variables[inp.yaxis].unit + ']',
                },
                zAxis3D: {
                    type: 'value',
                    name: inp.zaxis + ' [' + variables[inp.zaxis].unit + ']',
                },
                grid3D: {
                    viewControl: {
                        projection: 'orthographic'
                    }
                }
            });

            figure.type = 'line3D';
            figure.x = variables[inp.xaxis];
            figure.y = variables[inp.yaxis];
            figure.z = variables[inp.zaxis];
            figure.addSeries = function () {
                this.series.push({
                    type: 'line3D',
                    data: [],
                    lineStyle: {
                        width: 2
                    }
                });
            }
            figure.addData = function (data, isEndTime) {
                let x = this.x.processData(data);
                let y = this.y.processData(data);
                let z = this.z.processData(data);
                this.series[this.series.length - 1].data.push([x, y, z]);
                if (isEndTime) {
                    this.addSeries();
                }
            };
        } else {
            plot.setOption({
                tooltip: {},
                backgroundColor: '#fff',
                xAxis: {
                    type: 'value',
                    name: inp.xaxis + ' [' + variables[inp.xaxis].unit + ']',
                },
                yAxis: {
                    type: 'value',
                    name: inp.yaxis + ' [' + variables[inp.yaxis].unit + ']',
                }
            });

            figure.type = 'line';
            figure.x = variables[inp.xaxis];
            figure.y = variables[inp.yaxis];
            figure.series = [];
            figure.series.push({
                type: 'line',
                symbol: 'none',
                data: [],
                lineStyle: {
                    width: 2
                }
            });
            figure.addSeries = function () {
                this.series.push({
                    type: 'line',
                    symbol: 'none',
                    data: [],
                    lineStyle: {
                        width: 2
                    }
                });
            }
            figure.addData = function (data, isEndTime) {
                let x = this.x.processData(data);
                let y = this.y.processData(data);
                this.series[this.series.length - 1].data.push([x, y]);
                if (isEndTime) {
                    this.addSeries();
                }
            };
        }
        figure.updateFrame = function () {
            this.plot.setOption({ series: this.series })
        };

        figures[id] = figure;
    });

    $('#particles_plots').on('click', '.remove-button', function () {
        let figure = figures[this.dataset.figureid];
        echarts.dispose(figure.plot);
        delete figures[this.dataset.figureid];
        $(this).parents('.input-div').remove();
    });

    function addData(data, isEndTime) {
        for (const key in figures) {
            figures[key].addData(data, isEndTime);
        }
    };

    function updateFrame() {
        for (const key in figures) {
            figures[key].updateFrame();
        };
        setTimeout(updateFrame, 100);
    };
    updateFrame();

    function clearFigures() {
        for (const key in figures) {
            // TODO
        }
    };

});