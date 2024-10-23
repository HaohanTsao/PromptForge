import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:8000/api'; // FastAPI run on localhost:8000

    constructor(private http: HttpClient) { }

    optimizePrompt(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/optimize_prompt`, data);
    }

    testPrompt(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/test_prompt`, data);
    }
}