import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import * as watermark from 'watermarkjs';

import { SideBarPage } from '../side-bar/side-bar.page';
import { ModalController } from '@ionic/angular';

import { Flashlight } from '@ionic-native/flashlight/ngx';


@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
  providers: [Flashlight]
})


export class ResumenPage {

  @ViewChild('waterMarkedImage', {static: false}) waterMarkImage: ElementRef;
 
  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy: number;
  geoAddress: string;
  power: boolean = false;

 
  watchLocationUpdates: any; 
  loading: any;
  isWatching: boolean;

  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  originalImage = null;
  blobImage = null;
  locationCordinates: any;
  loadingLocation: boolean;
  public photos: Photo[] = [];

  cameraOptions: CameraOptions = {
    quality: 20,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  visible: boolean = false;
 
  constructor(
    private camera: Camera,
    private modalController: ModalController,
    private geolocation: Geolocation,
    private flashlight: Flashlight,
    private nativeGeocoder: NativeGeocoder
  ) {
  }

  toggle(event) {
    this.visible = !this.visible;
    this.switchFlashlight(event);
   }

   switchFlashlight(evento) {

    if(this.power == false)
      this.power = true;
    else
      this.power = false;

    if (this.power == true) {
      this.flashlight.switchOn();
    }
    else {
      this.flashlight.switchOff();
    }
  }

  getGeolocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.geoLatitude = resp.coords.latitude;
      this.geoLongitude = resp.coords.longitude; 
      this.geoAccuracy = resp.coords.accuracy; 
      this.getGeoencoder(this.geoLatitude,this.geoLongitude);
     }).catch((error) => {
       alert('Error getting location'+ JSON.stringify(error));
     });
  }

  getGeoencoder(latitude,longitude){
    this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
    .then((result: NativeGeocoderResult[]) => {
      this.geoAddress = this.generateAddress(result[0]);
    })
    .catch((error: any) => {
      alert('Error getting location'+ JSON.stringify(error));
    });
  }

  generateAddress(addressObj){
    let obj = [];
    let address = "";
    for (let key in addressObj) {
      obj.push(addressObj[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if(obj[val].length)
      address += obj[val]+', ';
    }
    return address.slice(0, -2);
}

  takeSnap() {
    this.getGeolocation();
    this.camera.getPicture(this.cameraOptions).then((imageData) => {
     this.originalImage = 'data:image/jpeg;base64,' + imageData;
     fetch(this.originalImage)
        .then(res => res.blob())
        .then(blob => {
          this.blobImage = blob;
          this.watermarkImage();
    });
    }, (error) => {
       console.log(error);
    });
  }

  watermarkImage() {
    watermark([this.blobImage])
    .image(watermark.text.lowerLeft('('  +  this.geoAddress  +  ')', '200px serif', '#fff', 0.6))
      .then(img => {
        this.waterMarkImage.nativeElement.src = img.src;
      });
    this.photos.unshift({
        data: 'data:image/jpeg;base64,' + ImageData
        });
  }

  async SideBar() {
    const modal = await this.modalController.create({
      component: SideBarPage,
      cssClass: 'my-custom-modal-css'
    });

    modal.onDidDismiss().then((data) => {
    });
    return await modal.present();
  }

}
class Photo {
  data: any;
}
