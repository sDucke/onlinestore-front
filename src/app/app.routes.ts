import { Routes } from '@angular/router';
import { Landing } from './common/landing/landing';
import { Home } from './pages/home/home';
import { Publicar } from './pages/publicar/publicar';
import { ConfigurarProducto } from './pages/configurar-producto/configurar-producto';
import { Disenos } from './pages/disenos/disenos';
import { ProductoDetalle } from './pages/producto-detalle/producto-detalle';
import { Login } from './pages/login/login';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: '',
        component: Landing,
        canActivateChild: [authGuard],
        children: [
            { path: '', component: Home },
            { path: 'publicar', component: Publicar },
            { path: 'configurar-producto', component: ConfigurarProducto },
            { path: 'disenos', component: Disenos },
            { path: 'producto/:id', component: ProductoDetalle }
        ]
    }
];
