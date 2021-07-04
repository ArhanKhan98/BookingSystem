import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Coordinates } from '../models/coordinates';
import { FetchDataService } from '../services/fetch-data.service';

@Component({
  selector: 'app-step-one',
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.scss']
})
export class StepOneComponent implements OnInit {

  constructor(private _fetchDataService: FetchDataService, private fb: FormBuilder, public router: Router, private route: ActivatedRoute, private datePipe: DatePipe) { }

  productList;
  extras={};
  currentDate = new Date();
  selectedTypeValue='';
  totalPrice = 0;
  gratuity;
  subTotal;
  autocomplete: google.maps.places.Autocomplete;
  pickupCoordinates;
  distanceCalculated = 0;
  dropCoordinates;
  totalHours = 0;
  extraDataAvailable = false;

  vehicleDetailBase;

  isAirportSelected = false;

  dataRecieved = false;

  childSeatPrice = 0;
  extraStopPrice = 0;
  gateMeetPrice = 0;
  vehicleBasePrice = 0;

  priceByDistance = 0;
  priceByHour = 0;
  companyId;

  selectedVehicleName='';
  isLoading = false;
  gateMeetVisibility:boolean =  false;
  toTheAirport;
  fromTheAirport;

  toTheAirportPrice = 0;
  fromTheAirportPrice = 0;

  isNightToll = false;
  nightTollPrice= 0;

  discountedPrice = 0;
  toAirport = 0;
  fromAirport = 0;
  nightToll=0;


  toddlerSeatPrice = 0;
  infantSeatPrice = 0;
  boosterSeatPrice = 0;
  metaData;

  rushHourPrice = 0;
  rushHour = 0;

  selectedDate;
  dropAndPickLocation : any;
  

  ngOnInit(): void {
    this.dropAndPickLocation = this.getToFromPredefinedLocation();
    this.isLoading = true;
    this.route.params.subscribe(
      (res:any)=>{
        console.log(res);
        this.companyId = res.id;
      },
      err=>{
        console.log(err);
      }
    )
    this._fetchDataService.getProductsList(this.companyId).subscribe(
      (res:any)=>{
        
        this.productList = res.products;
        this.extras = res.extras;
        this.extraDataAvailable = true;
        this.metaData = res.metadata;
        console.log(this.extras);
        
        this.gateMeetVisibility = this.extras['gate-meet'].visible;
        this.dataRecieved = true;
        this.isLoading = false;
      },
      err=>{
        console.log(err);
        this.isLoading = false;
      }
    )

    this.formStep1.patchValue({
      option: '',
      date: '',
      time: '',
      pickupLocation: '',
      dropLocation: '',
      hours: '',
      passengers: '',
      luggage: 0,
      'toddler-seat': 0,
      'infant-seat': 0,
      'booster-seat': 0,
      'extra-stops': 0,
      'gate-meet': false,
      email: '',
      selectedVehicle: ''
    })
  }

  formStep1 = this.fb.group({
    option: ['', [Validators.required]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    pickupLocation: ['', [Validators.required]],
    dropLocation: ['', [Validators.required]],
    hours: ['', [Validators.required]],
    airline: [''],
    flight: [''],
    specialNote: [''],
    name: ['',[Validators.required]],
    contactNumber: ['', [Validators.required]],
    passengers: [''],
    luggage: [''],
    'toddler-seat': ['', [Validators.required]],
    'infant-seat': ['', [Validators.required]],
    'booster-seat': ['', [Validators.required]],
    'extra-stops': ['', [Validators.required]],
    'gate-meet': ['', [Validators.required]],
    email: ['', [Validators.required,Validators.email]],
    selectedVehicle: ['', [Validators.required]]
  });

  get step1formDataControl() { return this.formStep1.controls }

  submitFormOne(){
    // console.log(this.formStep1.value);
    if(this.formStep1.valid){
      var formValue = this.formStep1.value;
      var newFormData = {
        "amount": this.totalPrice,
        "email": formValue.email,
        "option": this.selectedTypeValue,
        "date": this.selectedDate,
        "time": formValue.time,
        "pickupLocation": formValue.pickupLocation,
        "dropLocation": formValue.dropLocation,
        "hours": +formValue.hours,
        "passengers": +formValue.passengers,
        "luggage": +formValue.luggage,
        "gratuity": this.gratuity,
        "airline": formValue.airline,
        "flight": formValue.flight,
        "specialNote": formValue.specialNote,
        "subtotal": this.subTotal,
        "imgUrl": this.productList[formValue.selectedVehicle].url,
        "vehicleBasePrice": this.vehicleBasePrice,
        "childSeatPrice": this.childSeatPrice,
        "toddlerSeatPrice": this.toddlerSeatPrice,
        "infantSeatPrice": this.infantSeatPrice,
        "boosterSeatPrice": this.boosterSeatPrice,
        "extraStopPrice" : this.extraStopPrice,
        "gateMeetPrice": this.gateMeetPrice,
        "priceByDistance": this.priceByDistance,
        "priceByHour": this.priceByHour,
        "name": formValue.name,
        "contactNumber": formValue.contactNumber,
        "fromAirportToll": this.fromTheAirportPrice,
        "toAirportToll": this.toTheAirportPrice,
        "nightToll": this.nightTollPrice,
        "rushHourPrice": this.rushHourPrice,
        "selectedVehicleName": this.selectedVehicleName,
        policyUrl: this.metaData['privacy-url'],
        "products": {
          [formValue.selectedVehicle]: + this.vehicleDetailBase
        },
        "extras": {
          "child-seat": 0,
          "toddler-seat": +formValue['toddler-seat'],
          "infant-seat": +formValue['infant-seat'],
          "booster-seat": +formValue['booster-seat'],
          "extra-stops": +formValue['extra-stops'],
          "gate-meet": +formValue['gate-meet'],
          "to-airport": this.toAirport,
          "from-airport": this.fromAirport,
          "rush-hour": this.rushHour,
          "night-toll": this.nightToll
        }
      }
      localStorage.setItem('formStep1', JSON.stringify(newFormData));
      console.log(newFormData);
      this.router.navigate(['step-two/' + this.companyId]);
    }
    else{
      this.formStep1.markAllAsTouched();
    }
  }


  onChangeType(value){
    if (value == 'Door to Door' || value == 'Long Distance Servic' ){
      this.selectedTypeValue = 'pay-by-distance';
      this.isAirportSelected = false;
      this.calculatePrice();
    }
    else if (value == 'From the Airport' || value == 'To the Airport'){
      this.selectedTypeValue = 'pay-by-distance';
      this.isAirportSelected = true;
      if (value == 'From the Airport'){
        this.fromTheAirport = true;
        this.toTheAirport = false;
        this.fromAirport = 1;
        this.toAirport = 0;
        this.calculatePrice();
      }
      else{
        this.fromTheAirport = false;
        this.toTheAirport = true;
        this.fromAirport = 0;
        this.toAirport = 1;
        this.calculatePrice();
      }
    }
    else{
      this.selectedTypeValue = 'pay-by-hour';
      this.isAirportSelected = false;
      this.calculatePrice();
    }
    // this.selectedTypeValue = value;
    console.log('option : ' +  this.selectedTypeValue)
    
  }

  onChangeHours(event){
    console.log(event);
    if(event == ''){

    }
    else if(event < 2 ){
      alert('Note: You cannot book a ride for less than 2 Hours.');
      this.formStep1.patchValue({
        hours: 2
      })
    }
    this.calculatePrice();
  }

  onChangeVehicle(e){
    this.onChangeVehicleName(e.target.value);
    this.calculatePrice();
  }

  onChangeChildSeat() {
    this.calculatePrice();
  }
  onChangeExtraStops() {
    this.calculatePrice();
  }
  onChangeGateMeet(){
    this.calculatePrice();
  }
  onChangePassengers(){
    this.calculatePrice();
  }
  onChangeTime(val){
    console.log(val.split(':'));
    let t = 0;
    let t1 = +val.split(':')[0] * 60;
    t = t1 + (+val.split(':')[1]);
    console.log(t);
    if(t >= 1260 && t <= 1440){
      this.nightTollPrice = this.extras['night-toll']['cost-per-item'];
      this.nightToll = 1;
      this.rushHour = 0;
      this.rushHourPrice = 0;
    }
    else if (t >= 0 && t <= 300) {
      this.nightTollPrice = this.extras['night-toll']['cost-per-item'];
      this.nightToll = 1;
      this.rushHour = 0;
      this.rushHourPrice = 0;
    }
    else if(t >= 900 && t <= 1080){
      console.log('time changes triggered in rush hour braket');
      this.rushHourPrice = this.extras['rush-hour']['cost-per-item'];
      this.rushHour = 1;
      this.nightTollPrice = 0;
      this.nightToll = 0;
    }
    else{
      this.nightTollPrice = 0;
      this.nightToll = 0;
      this.rushHour= 0;
      this.rushHourPrice= 0;
    }
    this.calculatePrice();
  }

  onChangeVehicleName(vehicleId){
    this.selectedVehicleName = this.productList[vehicleId].name;
  }
  calculatePrice(){
    if (this.selectedTypeValue === 'pay-by-distance' ){
      // console.log('pay by distance');
      this.formStep1.patchValue({
        hours: '0'
      })
      
      this.priceByHour = 0;
      var vehicleBasePrice = this.productList[this.formStep1.value.selectedVehicle]['base-fare'];
      this.vehicleBasePrice = vehicleBasePrice;
      console.log('Base Price : ' + vehicleBasePrice);
      var productPrice = this.roundNumber(vehicleBasePrice + (this.distanceCalculated * this.productList[this.formStep1.value.selectedVehicle]['pay-by-distance']));
      console.log('Product Price : ' + productPrice);
      this.priceByDistance = this.roundNumber(this.distanceCalculated * this.productList[this.formStep1.value.selectedVehicle]['pay-by-distance']);
      
      // var childSeatPrice = this.extras['child-seat']['cost-per-item'] * this.formStep1.value['child-seat'];
      // this.childSeatPrice = childSeatPrice;
      var toddlerSeat = this.extras['toddler-seat']['cost-per-item'] * this.formStep1.value['toddler-seat'];
      // this.childSeatPrice = childSeatPrice;
      this.toddlerSeatPrice = toddlerSeat;
      var infantSeat = this.extras['infant-seat']['cost-per-item'] * this.formStep1.value['infant-seat'];
      // this.childSeatPrice = childSeatPrice;
      this.infantSeatPrice = infantSeat;
      var boosterSeat = this.extras['booster-seat']['cost-per-item'] * this.formStep1.value['booster-seat'];
      // this.childSeatPrice = childSeatPrice;
      this.boosterSeatPrice = boosterSeat;

      var extraStops = this.extras['extra-stops']['cost-per-item'] * this.formStep1.value['extra-stops'];
      this.extraStopPrice = extraStops;
      var gateMeet = this.extras['gate-meet']['cost-per-item'] * (+this.formStep1.value['gate-meet']);
      this.gateMeetPrice = gateMeet;

      
      var extraPrice = this.roundNumber(toddlerSeat + infantSeat + boosterSeat + extraStops + gateMeet + this.rushHourPrice);
      if (this.isAirportSelected) {
        if (this.fromTheAirport) {
          this.toTheAirportPrice = 0;
          this.fromTheAirportPrice = this.extras['from-airport']['cost-per-item'];
          extraPrice = extraPrice + this.fromTheAirportPrice + this.nightTollPrice;
        }
        else if (this.toTheAirport) {
          this.fromTheAirport = 0;
          this.toTheAirportPrice = this.extras['to-airport']['cost-per-item'];
          extraPrice = extraPrice + this.toTheAirportPrice + this.nightTollPrice;
        }
      }
      console.log('Extra : ' + extraPrice);
      
      var subTotal = productPrice + extraPrice;
      this.subTotal = this.roundNumber(subTotal);
      console.log('SubTotal : ' + subTotal);
      this.gratuity = this.roundNumber(subTotal * .2);
      this.totalPrice = this.roundNumber(subTotal + this.gratuity);
      this.discountedPrice = this.roundNumber(this.totalPrice - (this.totalPrice * 10)/100);
      this.vehicleDetailBase= this.distanceCalculated;

    }
    else if (this.selectedTypeValue === 'pay-by-hour') {
      // console.log('pay by Hour');
      this.priceByDistance = 0;
      var vehicleBasePrice = this.productList[this.formStep1.value.selectedVehicle]['base-fare'];
      console.log('Base Price : ' + vehicleBasePrice);
      this.vehicleBasePrice = vehicleBasePrice;
      var productPrice = this.roundNumber(vehicleBasePrice + (this.formStep1.value.hours * this.productList[this.formStep1.value.selectedVehicle]['pay-by-hour']));
      this.priceByHour = this.roundNumber(this.formStep1.value.hours * this.productList[this.formStep1.value.selectedVehicle]['pay-by-hour']);
      console.log('Product Price : ' + productPrice);
      this.totalHours = this.formStep1.value.hours;

      // var childSeatPrice = this.extras['child-seat']['cost-per-item'] * this.formStep1.value['child-seat'];
      // this.childSeatPrice = childSeatPrice;
      var toddlerSeat = this.extras['toddler-seat']['cost-per-item'] * this.formStep1.value['toddler-seat'];
      // this.childSeatPrice = childSeatPrice;
      this.toddlerSeatPrice = toddlerSeat;
      var infantSeat = this.extras['infant-seat']['cost-per-item'] * this.formStep1.value['infant-seat'];
      // this.childSeatPrice = childSeatPrice;
      this.infantSeatPrice = infantSeat;
      var boosterSeat = this.extras['booster-seat']['cost-per-item'] * this.formStep1.value['booster-seat'];
      // this.childSeatPrice = childSeatPrice;
      this.boosterSeatPrice = boosterSeat;
      var extraStops = this.extras['extra-stops']['cost-per-item'] * this.formStep1.value['extra-stops'];
      this.extraStopPrice = extraStops;
      var gateMeet = this.extras['gate-meet']['cost-per-item'] * (+this.formStep1.value['gate-meet']);
      this.gateMeetPrice = gateMeet;

      var extraPrice = this.roundNumber(toddlerSeat + infantSeat + boosterSeat + extraStops + gateMeet + this.nightTollPrice + this.rushHourPrice);
      console.log('Extra : ' + extraPrice);
      var subTotal = productPrice + extraPrice;
      this.subTotal = this.roundNumber(subTotal);
      console.log('SubTotal : ' + subTotal);
      this.gratuity = this.roundNumber(subTotal * .2);
      this.totalPrice = this.roundNumber(subTotal + this.gratuity);
      this.discountedPrice = this.roundNumber(this.totalPrice - (this.totalPrice * 10) / 100);
      this.vehicleDetailBase = this.formStep1.value.hours;
    }
  }

  pickupChanged(place) {
    // console.log(place);
    if (place) {
      this.pickupCoordinates = new Coordinates();
      this.pickupCoordinates.lat = place.geometry.location.lat();
      this.pickupCoordinates.long = place.geometry.location.lng();
      this.formStep1.patchValue({
        pickupLocation: place.formatted_address
      })
    }
    this.getDistanceBetween(this.pickupCoordinates.lat, this.pickupCoordinates.long, this.dropCoordinates.lat, this.dropCoordinates.long);
  }

  dropChanged(place) {
    if (place) {
      this.dropCoordinates = new Coordinates();
      this.dropCoordinates.lat = place.geometry.location.lat();
      this.dropCoordinates.long = place.geometry.location.lng();
      this.formStep1.patchValue({
        dropLocation: place.formatted_address
      })
    }
    this.getDistanceBetween(this.pickupCoordinates.lat, this.pickupCoordinates.long, this.dropCoordinates.lat, this.dropCoordinates.long);
  }

  getDistanceBetween(lat1, long1, lat2, long2) {
    var from = new google.maps.LatLng(lat1, long1);
    var to = new google.maps.LatLng(lat2, long2);
    //   console.log('Distance Between', google.maps.geometry.spherical.computeDistanceBetween(
    //     from, to
    //   ));
    // this.distanceCalculated = this.roundNumber(google.maps.geometry.spherical.computeDistanceBetween(from, to) / 1609) ;
    // console.log('Distance : ' + this.distanceCalculated);
    // let newOrigin = [lat1.toString(), long1.toString()];
    // let newDestination = [lat2.toString(), long2.toString()];
    let travelMode = google.maps.TravelMode.DRIVING;
    return new google.maps.DistanceMatrixService().getDistanceMatrix({ 'origins': [from], 'destinations': [to], travelMode: travelMode }, (results: any) => {
      console.log('Results (mts) -- ', results.rows[0].elements[0].distance.value);
      this.distanceCalculated = this.roundNumber(+(results.rows[0].elements[0].distance.value) / 1609);
      console.log(this.distanceCalculated);
      this.calculatePrice();
    });
  }

  roundNumber(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  onChangeDate(event){
    // console.log(console.log(this.datePipe.transform(event.target.value, "MM-dd-yyyy")));
    this.selectedDate = this.datePipe.transform(event.target.value, "MM-dd-yyyy");
  }
   
  getToFromPredefinedLocation()
  {
    let cord = new Coordinates();
    let preDefinedLocation = [];

    cord.lat = 40.6441666667;
    cord.long = -73.7822222222;
    preDefinedLocation.push({name:'JFK Internation',coordinates:cord});


    cord.lat = 42.3656;
    cord.long = 71.0096;
    preDefinedLocation.push({name:'Boston Logan International',coordinates:cord});

    cord.lat = 40.7747222222;
    cord.long = -73.8719444444;
    preDefinedLocation.push({name:'LaGuardia Airport',coordinates:cord});
  }

  preDefinedToAndFromAirport(place)
  {
    if(place !== null)
    {
      if(this.toTheAirport)
      {
        this.dropCoordinates = new Coordinates();
        this.dropCoordinates.lat = place?.cord?.lat;
        this.dropCoordinates.long = place?.cord?.long;
        this.formStep1.patchValue({
          dropLocation: place?.name
        });
        this.getDistanceBetween(this.pickupCoordinates.lat, this.pickupCoordinates.long, this.dropCoordinates.lat, this.dropCoordinates.long);
      }
      else if(this.fromTheAirport)
      {
        this.pickupCoordinates = new Coordinates();
        this.pickupCoordinates.lat = place?.cord?.lat;
        this.pickupCoordinates.long = place?.cord?.long;
        this.formStep1.patchValue({
          pickupLocation: place?.name
        });
        this.getDistanceBetween(this.pickupCoordinates.lat, this.pickupCoordinates.long, this.dropCoordinates.lat, this.dropCoordinates.long);
      }
    }
  }

}
