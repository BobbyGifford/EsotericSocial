import { Component, OnInit, OnDestroy } from "@angular/core";
import { PostModel } from "../post.model";
import { FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { PostsService } from "../posts.service";
import { mimeType } from "./mime-type.validator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit, OnDestroy {
  categories = [
    { label: "Symbols", value: "symbols" },
    { label: "People", value: "people" },
    { label: "Archaeology", value: "archaeology" },
    { label: "History", name: "history" },
    { label: "Consciousness", name: "consciousness" },
    { label: "Religon", value: "religon" }
  ];
  private mode = "create";
  private postId: string;
  private authStatusSub: Subscription;
  post: PostModel;
  isLoading = false;
  form: FormGroup;
  imagePreview = null;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      category: new FormControl(null, { validators: [Validators.required] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required] })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("id")) {
        this.mode = "edit";
        this.postId = paramMap.get("id");
        // Show spinner
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          // Hide Spinner
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            category: postData.category,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator
          };

          // Change image default field
          this.form.setValue({
            title: this.post.title,
            category: this.post.category,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onImagePicked(e: Event) {
    const file = (e.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postsService.addPost(
        {
          id: null,
          title: this.form.value.title,
          content: this.form.value.content,
          category: this.form.value.category,
          imagePath: null,
          creator: null
        },
        this.form.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.category,
        this.form.value.image
      );
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
