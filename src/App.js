import React from "react";
import $ from "jquery";
import axios from "axios";
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-date-picker';

const options = {
	scales: {
		y: {
			min: 0
		}
	}
};
let date = new Date();
class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openStartDate: new Date(date.getFullYear(), date.getMonth(), 1),
			openEndDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
			closedStartDate: new Date(date.getFullYear(), date.getMonth(), 1),
			closedEndDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
			openLabels: getDates(new Date(date.getFullYear(), date.getMonth(), 1), new Date(date.getFullYear(), date.getMonth() + 1, 0)),
			closedLabels: getDates(new Date(date.getFullYear(), date.getMonth(), 1), new Date(date.getFullYear(), date.getMonth() + 1, 0)),
			openData: new Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(0),
			closedData: new Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(0),
			openLineBGcolor: 'rgb(255, 99, 132)',
			closedLineBGcolor: 'rgb(91, 212, 91)'
		}
	}
	getStats(type) {
		let openDates = getDates(this.state.openStartDate, this.state.openEndDate);
		let closedDates = getDates(this.state.closedStartDate, this.state.closedEndDate);
		switch (type) {
			case 0:
				this.setState({
					openLabels: openDates,
					openData: new Array(openDates.length).fill(0),
				}, () => {
					this.getStatsFinish(type, openDates, closedDates);
				})
				break;
			case 1:
				this.setState({
					closedLabels: closedDates,
					closedData: new Array(closedDates.length).fill(0)
				}, () => {
					this.getStatsFinish(type, openDates, closedDates);
				})
				break;
		}
	}
	getStatsFinish(type, openDates, closedDates) {
		axios.post("http://83.220.175.94:3000/api/statistics", {
			startDate: [
				type === 0 ? this.state.openStartDate.getFullYear() : this.state.closedStartDate.getFullYear(),
				type === 0 ? this.state.openStartDate.getMonth() : this.state.closedStartDate.getMonth(),
				type === 0 ? this.state.openStartDate.getDate() : this.state.closedStartDate.getDate()
			],
			endDate: [
				type === 0 ? this.state.openEndDate.getFullYear() : this.state.closedEndDate.getFullYear(),
				type === 0 ? this.state.openEndDate.getMonth() : this.state.closedEndDate.getMonth(),
				type === 0 ? this.state.openEndDate.getDate() : this.state.closedEndDate.getDate()
			],
			type: type
		}, {
			headers: { 'Access-Control-Allow-Origin': '*' }
		}).then(res => {
			this.state.requests = [];
			res.data.forEach((el, i) => {
				switch (type) {
					case 0:
						this.state.openData[openDates.indexOf(el.id)] = parseInt(el.count);
						this.setState({
							openData: this.state.openData
						});
						break;
					case 1:
						this.state.closedData[closedDates.indexOf(el.id)] = parseInt(el.count);
						this.setState({
							closedData: this.state.closedData
						});
						break;
					default:
						break;
				}
			})

		})
	}
	componentDidMount() {
		this.getStats(0);
		this.getStats(1);
	}
	render() {

		let openData = {
			labels: this.state.openLabels.map((el, i) => el),
			datasets: [
				{
					label: 'Открытыъ обращений',
					data: this.state.openData,
					fill: false,
					backgroundColor: this.state.openLineBGcolor,
					borderColor: 'rgba(255, 99, 132, 0.2)',
				},
			],
		};
		let closedData = {
			labels: this.state.closedLabels.map((el, i) => el),
			datasets: [
				{
					label: 'Закрытых обращений',
					data: this.state.closedData,
					fill: false,
					backgroundColor: this.state.closedLineBGcolor,
					borderColor: 'rgba(255, 99, 132, 0.2)',
				},
			],
		};
		return (
			<div className="App h-100 w-100" style={{
				position: "absolute"
			}}>
				<div className="d-flex flex-row h-100 justify-content-center">
					<div className="d-flex flex-column" style={{
						width: "70vw",
						marginTop: "5vw"
					}}>
						<div className="d-flex flex-row">
							<div className="d-flex flex-column w-100">
								<div className="d-flex flex-row justify-content-center">
									<span>Статистика по открытым обращениям</span>
								</div>
								<div className="d-flex flex-row justify-content-center">
									<DatePicker
										key={200}
										className="customDatePicker"
										onChange={(e) => {
											let newDate = new Date(e);
											if (newDate.getTime() > this.state.openEndDate.getTime()) {
												return false;
											}
											this.setState({
												openStartDate: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
											}, () => {
												this.getStats(0);
											})
										}}
										value={this.state.openStartDate}
										format="d.M.y"
										clearIcon={null}
									/>
									<DatePicker
										key={201}
										className="customDatePicker"
										style={{
											margin: "5vw"
										}}
										onChange={(e) => {
											let newDate = new Date(e);
											if (newDate.getTime() < this.state.openStartDate.getTime()) {
												return false;
											}
											this.setState({
												openEndDate: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
											}, () => {
												this.getStats(0);
											})
										}}
										format="d.M.y"
										value={this.state.openEndDate}
										clearIcon={null}
									/>
								</div>
								<div className="d-flex flex-row">
									<Line data={openData} width={100}
										height={22} options={options} />
								</div>
							</div>

						</div>
						<div className="d-flex flex-row mt-5">
							<div className="d-flex flex-column w-100">
								<div className="d-flex flex-row justify-content-center">
									<span>Статистика по закрытым обращениям</span>
								</div>
								<div className="d-flex flex-row justify-content-center">
									<DatePicker
										key={300}
										className="customDatePicker"
										onChange={(e) => {
											let newDate = new Date(e);
											if (newDate.getTime() > this.state.closedEndDate.getTime()) {
												return false;
											}
											this.setState({
												closedStartDate: newDate
											}, () => {
												this.getStats(1);
											})
										}}
										value={this.state.closedStartDate}
										format="d.M.y"
										clearIcon={null}
									/>
									<DatePicker
										key={301}
										className="customDatePicker"
										style={{
											margin: "5vw"
										}}
										onChange={(e) => {
											let newDate = new Date(e);
											if (newDate.getTime() < this.state.closedStartDate.getTime()) {
												return false;
											}
											this.setState({
												closedEndDate: newDate
											}, () => {
												this.getStats(1);
											})
										}}
										format="d.M.y"
										value={this.state.closedEndDate}
										clearIcon={null}
									/>
								</div>
								<div className="d-flex flex-row">
									<Line data={closedData} width={100}
										height={22} options={options} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
}
function getDates(startDate, stopDate) {
	var dateArray = new Array();
	var currentDate = startDate;
	while (currentDate <= stopDate) {
		dateArray.push(`${new Date(currentDate).getDate() + "." + (parseInt(new Date(currentDate).getMonth()) + 1)}`);
		currentDate = currentDate.addDays(1);
	}
	return dateArray;
}