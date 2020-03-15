import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'; 

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.css']
})
export class TemplateFormComponent implements OnInit {

  usuario: any = {
    nome: null,
    email: null
  }

  onSubmit(form){
    console.log(form);

    //console.log(this.usuario);

    this.http.post('https://httpbin.org/post', JSON.stringify(form.value))
    .pipe(map(res => res))
    .subscribe(dados => console.log(dados));
  }

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  consultaCEP(cep, form){
    //Nova variável "cep" somente com dígitos.
    cep = cep.replace(/\D/g, '');

    //Verifica se campo cep possui valor informado.
    if (cep != ""){

      this.resetaDadosForm(form);

      //Expressão regular para validar o CEP.
      var validacep = /^[0-9]{8}$/;

      //Valida o formato do CEP.
      if(validacep.test(cep)){
        this.http.get(`//viacep.com.br/ws/${cep}/json`)
        .pipe(map(dados => dados))
        .subscribe(dados => this.populaDadosForm(dados, form));
      }
      
    }
  }

  populaDadosForm(dados, formulario) {
    /*form.setValue({
      nome: form.value.nome,
      email: form.value.email,
      rua: dados.logradouro,
      cep: dados.cep,
      numero: '',
      complemento: dados.complemento,
      bairro: dados.bairro,
      cidade: dados.localidade,
      estado: dados.uf
    });*/

    formulario.form.patchValue({
      rua: dados.logradouro,
      cep: dados.cep,
      complemento: dados.complemento,
      bairro: dados.bairro,
      cidade: dados.localidade,
      estado: dados.uf
    });

    // console.log(form);
  }

  resetaDadosForm(formulario) {
    formulario.form.patchValue({
      rua: null,
      complemento: null,
      bairro: null,
      cidade: null,
      estado: null
    });
  }

}
