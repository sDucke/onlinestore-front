import { Routes } from '@angular/router';
import { Landing } from './common/landing/landing';
import { Home } from './pages/home/home';
import { Publicar } from './pages/publicar/publicar';
import { ConfigurarProducto } from './pages/configurar-producto/configurar-producto';
import { Disenos } from './pages/disenos/disenos';

export const routes: Routes = [
    {
        path: '',
        component: Landing,
        children: [
            { path: '', component: Home },
            { path: 'publicar', component: Publicar },
            { path: 'configurar-producto', component: ConfigurarProducto },
            { path: 'disenos', component: Disenos }
        ]
    }
];
