import {Component} from '@angular/core';
import {PostModel} from '../post.model';
import {NgForm} from '@angular/forms';
import {PostsService} from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent {

  constructor(public postsService: PostsService) {
  }

  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const post: PostModel = {title: form.value.title, content: form.value.content};
    this.postsService.addPost(post);
    form.resetForm();
  }
}
