import {Component, OnInit} from '@angular/core';
import {PostModel} from '../post.model';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, ParamMap} from '@angular/router';

import {PostsService} from '../posts.service';
import {post} from 'selenium-webdriver/http';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  categories = [
    {value: 'celebrities', viewValue: 'Celebrities'},
    {value: 'politics', viewValue: 'Politics'},
  ];
  private mode = 'create';
  private postId: string;
  post: PostModel;
  isLoading = false;

  constructor(public postsService: PostsService, public route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.postId = paramMap.get('id');
        // Show spinner
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          // Hide Spinner
          this.isLoading = false;
          this.post = {id: postData._id, title: postData.title, category: postData.category, content: postData.content};
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost({id: null, title: form.value.title, content: form.value.content, category: form.value.chosenCategory});
    } else {
      this.postsService.updatePost({
        id: this.postId,
        title: form.value.title,
        content: form.value.content,
        category: form.value.chosenCategory
      });
    }
    form.resetForm();
  }
}
