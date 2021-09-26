import { Response } from './../models/response';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private baseUrl = `${environment.api + 'category' + '?API_KEY=' + environment.api_key}`;


  constructor(private http: HttpClient) { }

  getCategory(): Observable<Response> {
    return this.http.get<Response>(this.baseUrl);
  }
}
