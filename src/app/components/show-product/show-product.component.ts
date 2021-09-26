import { Category } from './../../models/category';
import { environment } from './../../../environments/environment';
import { Response } from './../../models/response';
import { FileUploadService } from './../../services/file-upload.service';
import { ProductsService } from './../../services/products.service';
import { Product } from './../../models/product';
import { Component, Input, OnInit } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-show-product',
  templateUrl: './show-product.component.html',
  styleUrls: ['./show-product.component.scss']
})
export class ShowProductComponent implements OnInit {

  @Input() products: Product[];
  productModalOpen = false;
  selectedProduct: Product;
  delete = false;
  productToBeDelete: Product;
  file: File;
  progress = 0;
  baseUrlImage = `${environment.api_image}`;

  constructor(private productService: ProductsService, private fileService: FileUploadService) { }

  ngOnInit(): void {
  }

  onEdit(product: Product): void {
    this.productModalOpen = true;
    this.selectedProduct = product;
  }

  handleFinish(event) {
    const product = event.product ? event.product : null;
    this.file = event.file ?? null;
    if (product) {
      if (this.selectedProduct) {
        // Mise a jour d'un produit
        product.idProduct = this.selectedProduct.idProduct;
        this.editProductToServer(product);
      } else {
        // Ajout d'un produit en bdd
        this.addProductToServer(product);
      }
    }
    this.productModalOpen = false;
  }

  onDelete(product: Product): void {
    this.delete = true;
    this.productToBeDelete = product;
  }

  handleCancelDelete() {
    this.delete = false;
  }

  handleConfirmDelete() {
    this.productService.deleteProduct(this.productToBeDelete).subscribe(
      (data: Response) => {
        if (data.status === 200) {
          // Delete Product Image
          this.fileService.deleteImage(this.productToBeDelete.image).subscribe(
            (dat: Response) => {
              console.log(dat);
            }
          );
          console.log(data);
          // Update Frontend
          const index = this.products.findIndex(x => x.idProduct === this.productToBeDelete.idProduct);
          this.products.splice(index, 1);

        } else {
          console.log(data.message);
        }
      }
    );
    this.handleCancelDelete();
  }

  addProduct(): void {
    this.selectedProduct = undefined;
    this.productModalOpen = true;
  }

  uploadImage(event) {
    return new Promise(
      (resolve, reject) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Requette envoyée avec succès');
            break;
          case HttpEventType.UploadProgress:
            this.progress = Math.round(event.loaded / event.total * 100);
            if (this.progress === 100) {
              resolve(true);
            }
            break;
          case HttpEventType.Response:
            console.log(event.body);
            setTimeout(() => {
              this.progress = 0;
            }, 1500);
            break;
          default:
            break;
        }
      }
    );
  }

  addProductToServer(product) {
    this.productService.addProduct(product).subscribe(
      (data: Response) => {
        if (data.status === 200) {
          // Mise a jour frontend
          if (this.file) {
            this.fileService.uploadImage(this.file).subscribe((
              // tslint:disable-next-line: no-shadowed-variable
              (event: HttpEvent<any>) => {
                this.uploadImage(event).then(
                  () => {
                    product.idProduct = data.args.lastInsertId;
                    product.Category = product.category;
                    this.products.push(product);
                  }
                );
              }
            ));
          }
        }
      }
    );
  }

  editProductToServer(product) {
    this.productService.editProduct(product).subscribe(
      (data: Response) => {
        if (data.status === 200) {
          // Mise a jour frontend
          if (this.file) {
            this.fileService.uploadImage(this.file).subscribe(
              // tslint:disable-next-line: no-shadowed-variable
              (event: HttpEvent<any>) => {
                this.uploadImage(event).then(
                  () => {
                    // update frontend
                    this.updateProducts(product);
                  }
                );
              }
            );
            // Si il y a une image, il faut supprimer l'ancienne
            this.fileService.deleteImage(product.oldImage).subscribe(
              // tslint:disable-next-line: no-shadowed-variable
              (data: Response) => {
                console.log(data);
              }
            );
          } else {
              // update frontend
            this.updateProducts(product);
          }
        } else {
          console.log(data.message);
        }
      }
    );
  }

  updateProducts(product) {
    // update frontend
    const index = this.products.findIndex(p => p.idProduct === product.idProduct);
    product.Category = product.category;
    this.products = [
      ...this.products.slice(0, index),
      product,
      ...this.products.slice(index + 1)
    ];
  }


}
