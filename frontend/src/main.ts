import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { BasicBlockComponent } from './app/app.component';

bootstrapApplication(BasicBlockComponent, appConfig)
  .catch(err => console.error(err));